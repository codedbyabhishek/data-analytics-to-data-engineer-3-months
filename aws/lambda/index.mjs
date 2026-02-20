import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PROFILES_TABLE = process.env.PROFILES_TABLE;
const PROGRESS_TABLE = process.env.PROGRESS_TABLE;
const LOGS_TABLE = process.env.LOGS_TABLE;
const DEFAULT_COURSE_ID = "analytics-to-de";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || "";
const STRIPE_PRICE_TEAM = process.env.STRIPE_PRICE_TEAM || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const APP_BASE_URL = process.env.APP_BASE_URL || "https://codedbyabhishek.github.io/data-analytics-to-data-engineer-3-months/";

const WEEK_IDS = Array.from({ length: 13 }, (_, i) => i);

function defaultCompletedWeeks() {
  const completed = {};
  for (const id of WEEK_IDS) {
    completed[id] = false;
  }
  return completed;
}

function defaultTaskProgress() {
  const taskProgress = {};
  for (const id of WEEK_IDS) {
    taskProgress[id] = [];
  }
  return taskProgress;
}

function defaultCourseProgress() {
  return {
    goalWeeklyHours: 20,
    completedWeeks: defaultCompletedWeeks(),
    taskProgress: defaultTaskProgress(),
    certificate: null
  };
}

function defaultCoursesProgress() {
  return {
    [DEFAULT_COURSE_ID]: defaultCourseProgress()
  };
}

function normalizeProgress(item = {}) {
  if (item.courses && item.activeCourseId) {
    return {
      activeCourseId: item.activeCourseId,
      courses: item.courses
    };
  }

  return {
    activeCourseId: DEFAULT_COURSE_ID,
    courses: {
      [DEFAULT_COURSE_ID]: {
        goalWeeklyHours: Number(item.goalWeeklyHours || 20),
        completedWeeks: item.completedWeeks || defaultCompletedWeeks(),
        taskProgress: item.taskProgress || defaultTaskProgress(),
        certificate: item.certificate || null
      }
    }
  };
}

function plansCatalog() {
  return [
    {
      id: "free",
      name: "Free",
      monthlyUsd: 0,
      features: ["Core tracker", "Single learner dashboard", "Progress logs"]
    },
    {
      id: "pro",
      name: "Pro",
      monthlyUsd: 19,
      features: ["All courses", "Certificates + sharing", "Advanced analytics"]
    },
    {
      id: "team",
      name: "Team",
      monthlyUsd: 79,
      features: ["Team dashboard", "Multiple learners", "Admin controls"]
    }
  ];
}

function stripePriceForPlan(planId) {
  if (planId === "pro") return STRIPE_PRICE_PRO;
  if (planId === "team") return STRIPE_PRICE_TEAM;
  return "";
}

function planFromPriceId(priceId = "") {
  if (priceId && priceId === STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === STRIPE_PRICE_TEAM) return "team";
  return "free";
}

function getHeader(headers = {}, key = "") {
  const foundKey = Object.keys(headers).find((k) => k.toLowerCase() === key.toLowerCase());
  return foundKey ? headers[foundKey] : "";
}

function verifyStripeSignature(rawBody, stripeSignature) {
  if (!STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook secret is not configured");
  if (!stripeSignature) throw new Error("Missing Stripe-Signature header");

  const parts = stripeSignature.split(",").map((p) => p.trim());
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || !signatures.length) throw new Error("Invalid Stripe signature header");

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", STRIPE_WEBHOOK_SECRET).update(payload).digest("hex");

  return signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
    } catch {
      return false;
    }
  });
}

async function setUserSubscription({
  userId,
  email = "",
  plan = "free",
  status = "active",
  stripeCustomerId = "",
  stripeSubscriptionId = ""
}) {
  const now = new Date().toISOString();
  await ddb.send(
    new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId },
      UpdateExpression:
        "SET subscriptionPlan = :plan, subscriptionStatus = :status, subscriptionUpdatedAt = :ts, updatedAt = :ts, email = :email, stripeCustomerId = :customerId, stripeSubscriptionId = :subscriptionId",
      ExpressionAttributeValues: {
        ":plan": plan,
        ":status": status,
        ":ts": now,
        ":email": email,
        ":customerId": stripeCustomerId,
        ":subscriptionId": stripeSubscriptionId
      }
    })
  );
  return now;
}

async function handleStripeEvent(evt) {
  const type = evt?.type || "";
  const object = evt?.data?.object || {};

  if (type === "checkout.session.completed") {
    const userId = object?.metadata?.userId || object?.client_reference_id || "";
    const planId = object?.metadata?.planId || "free";
    if (!userId) return;

    await setUserSubscription({
      userId,
      email: object?.customer_details?.email || "",
      plan: ["pro", "team"].includes(planId) ? planId : "free",
      status: "active",
      stripeCustomerId: object?.customer || "",
      stripeSubscriptionId: object?.subscription || ""
    });
    return;
  }

  if (type === "customer.subscription.updated" || type === "customer.subscription.created") {
    const userId = object?.metadata?.userId || "";
    if (!userId) return;
    const priceId = object?.items?.data?.[0]?.price?.id || "";
    const plan = planFromPriceId(priceId);
    const status = object?.status || "active";

    await setUserSubscription({
      userId,
      plan,
      status,
      stripeCustomerId: object?.customer || "",
      stripeSubscriptionId: object?.id || ""
    });
    return;
  }

  if (type === "customer.subscription.deleted") {
    const userId = object?.metadata?.userId || "";
    if (!userId) return;

    await setUserSubscription({
      userId,
      plan: "free",
      status: "canceled",
      stripeCustomerId: object?.customer || "",
      stripeSubscriptionId: object?.id || ""
    });
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function getUser(event) {
  const claims = event?.requestContext?.authorizer?.jwt?.claims;
  if (!claims?.sub) {
    throw new Error("Unauthorized");
  }
  return {
    userId: claims.sub,
    email: claims.email || ""
  };
}

async function getOrCreateProfile(userId, email) {
  const current = await ddb.send(
    new GetCommand({
      TableName: PROFILES_TABLE,
      Key: { userId }
    })
  );

  if (current.Item) {
    return current.Item;
  }

  const now = new Date().toISOString();
  const created = {
    userId,
    fullName: email || "Learner",
    email,
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    stripeCustomerId: "",
    stripeSubscriptionId: "",
    subscriptionUpdatedAt: now,
    createdAt: now,
    updatedAt: now
  };

  await ddb.send(
    new PutCommand({
      TableName: PROFILES_TABLE,
      Item: created
    })
  );

  return created;
}

async function getOrCreateProgress(userId) {
  const current = await ddb.send(
    new GetCommand({
      TableName: PROGRESS_TABLE,
      Key: { userId }
    })
  );

  if (current.Item) {
    return current.Item;
  }

  const now = new Date().toISOString();
  const created = {
    userId,
    activeCourseId: DEFAULT_COURSE_ID,
    courses: defaultCoursesProgress(),
    createdAt: now,
    updatedAt: now
  };

  await ddb.send(
    new PutCommand({
      TableName: PROGRESS_TABLE,
      Item: created
    })
  );

  return created;
}

async function listLogs(userId, courseId = "") {
  const result = await ddb.send(
    new QueryCommand({
      TableName: LOGS_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    })
  );

  let logs = (result.Items || []).sort((a, b) => (a.logDate < b.logDate ? 1 : -1));
  if (courseId) {
    logs = logs.filter((item) => (item.courseId || DEFAULT_COURSE_ID) === courseId);
  }
  return logs;
}

async function replaceAllLogs(userId, logs) {
  const existing = await listLogs(userId);

  const deleteRequests = existing.map((item) => ({
    DeleteRequest: {
      Key: { userId, id: item.id }
    }
  }));

  const putRequests = logs.map((item) => ({
    PutRequest: {
      Item: {
        userId,
        id: randomUUID(),
        logDate: item.logDate,
        weekNo: Number(item.weekNo),
        courseId: item.courseId || DEFAULT_COURSE_ID,
        topic: item.topic,
        hours: Number(item.hours),
        notes: item.notes || "",
        createdAt: new Date().toISOString()
      }
    }
  }));

  const all = [...deleteRequests, ...putRequests];
  while (all.length) {
    const chunk = all.splice(0, 25);
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: {
          [LOGS_TABLE]: chunk
        }
      })
    );
  }
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method;
    const path = event.rawPath;

    if (method === "POST" && path === "/billing/stripe-webhook") {
      const rawBody = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "";
      const stripeSig = getHeader(event.headers || {}, "stripe-signature");
      const verified = verifyStripeSignature(rawBody, stripeSig);
      if (!verified) {
        return response(400, { error: "Invalid Stripe signature" });
      }

      const stripeEvent = JSON.parse(rawBody || "{}");
      await handleStripeEvent(stripeEvent);
      return response(200, { received: true });
    }

    const { userId, email } = getUser(event);

    if (method === "GET" && path === "/profile") {
      const profile = await getOrCreateProfile(userId, email);
      return response(200, profile);
    }

    if (method === "GET" && path === "/billing/plans") {
      return response(200, { plans: plansCatalog() });
    }

    if (method === "GET" && path === "/billing/subscription") {
      const profile = await getOrCreateProfile(userId, email);
      return response(200, {
        plan: profile.subscriptionPlan || "free",
        status: profile.subscriptionStatus || "active",
        updatedAt: profile.subscriptionUpdatedAt || profile.updatedAt
      });
    }

    if (method === "POST" && path === "/billing/create-checkout-session") {
      const body = JSON.parse(event.body || "{}");
      const planId = String(body.planId || "").trim();
      const validPlan = ["pro", "team"].includes(planId);
      if (!validPlan) {
        return response(400, { error: "planId must be pro or team" });
      }

      const priceId = stripePriceForPlan(planId);
      if (!STRIPE_SECRET_KEY || !priceId) {
        return response(400, {
          error: "Stripe not configured",
          hint: "Set STRIPE_SECRET_KEY and STRIPE_PRICE_PRO/TEAM environment variables."
        });
      }

      const form = new URLSearchParams();
      form.set("mode", "subscription");
      form.set("success_url", `${APP_BASE_URL}?billing=success&plan=${planId}`);
      form.set("cancel_url", `${APP_BASE_URL}?billing=cancel`);
      form.set("line_items[0][price]", priceId);
      form.set("line_items[0][quantity]", "1");
      form.set("client_reference_id", userId);
      form.set("customer_email", email);
      form.set("metadata[userId]", userId);
      form.set("metadata[planId]", planId);

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "content-type": "application/x-www-form-urlencoded"
        },
        body: form
      });

      const stripePayload = await stripeRes.json();
      if (!stripeRes.ok) {
        return response(400, {
          error: stripePayload?.error?.message || "Failed to create Stripe checkout session"
        });
      }

      return response(200, { checkoutUrl: stripePayload.url || "" });
    }

    if (method === "POST" && path === "/billing/set-plan") {
      const body = JSON.parse(event.body || "{}");
      const plan = String(body.plan || "free").trim();
      const status = String(body.status || "active").trim();
      if (!["free", "pro", "team"].includes(plan)) {
        return response(400, { error: "Invalid plan" });
      }

      const now = new Date().toISOString();
      await setUserSubscription({ userId, email, plan, status });

      return response(200, { ok: true, plan, status, updatedAt: now });
    }

    if (method === "PUT" && path === "/profile") {
      const body = JSON.parse(event.body || "{}");
      const fullName = String(body.fullName || "").trim();
      if (!fullName) {
        return response(400, { error: "fullName is required" });
      }

      const now = new Date().toISOString();
      await ddb.send(
        new UpdateCommand({
          TableName: PROFILES_TABLE,
          Key: { userId },
          UpdateExpression: "SET fullName = :fullName, updatedAt = :updatedAt, email = :email",
          ExpressionAttributeValues: {
            ":fullName": fullName,
            ":updatedAt": now,
            ":email": email
          }
        })
      );

      const profile = await getOrCreateProfile(userId, email);
      return response(200, profile);
    }

    if (method === "GET" && path === "/progress") {
      const progress = await getOrCreateProgress(userId);
      return response(200, normalizeProgress(progress));
    }

    if (method === "PUT" && path === "/progress") {
      const body = JSON.parse(event.body || "{}");
      const normalized = normalizeProgress(body);
      const now = new Date().toISOString();

      const existing = await getOrCreateProgress(userId);

      await ddb.send(
        new PutCommand({
          TableName: PROGRESS_TABLE,
          Item: {
            userId,
            activeCourseId: normalized.activeCourseId || DEFAULT_COURSE_ID,
            courses: normalized.courses || defaultCoursesProgress(),
            updatedAt: now,
            createdAt: existing.createdAt || now
          }
        })
      );

      const progress = await getOrCreateProgress(userId);
      return response(200, normalizeProgress(progress));
    }

    if (method === "GET" && path === "/logs") {
      const courseId = event?.queryStringParameters?.courseId || "";
      const logs = await listLogs(userId, courseId);
      return response(200, { logs });
    }

    if (method === "POST" && path === "/logs") {
      const body = JSON.parse(event.body || "{}");
      const log = {
        userId,
        id: randomUUID(),
        logDate: body.logDate,
        weekNo: Number(body.weekNo),
        courseId: String(body.courseId || DEFAULT_COURSE_ID),
        topic: String(body.topic || "").trim(),
        hours: Number(body.hours),
        notes: String(body.notes || ""),
        createdAt: new Date().toISOString()
      };

      if (!log.logDate || !log.topic || !log.hours || log.weekNo < 0 || log.weekNo > 12) {
        return response(400, { error: "Invalid log payload" });
      }

      await ddb.send(
        new PutCommand({
          TableName: LOGS_TABLE,
          Item: log
        })
      );

      return response(201, log);
    }

    if (method === "DELETE" && path.startsWith("/logs/")) {
      const id = decodeURIComponent(path.replace("/logs/", "")).trim();
      if (!id) {
        return response(400, { error: "Log id is required" });
      }

      await ddb.send(
        new DeleteCommand({
          TableName: LOGS_TABLE,
          Key: { userId, id }
        })
      );

      return response(200, { ok: true });
    }

    if (method === "POST" && path === "/import") {
      const body = JSON.parse(event.body || "{}");
      if (!body?.progress || !Array.isArray(body.logs)) {
        return response(400, { error: "Invalid import payload" });
      }

      const now = new Date().toISOString();
      const existing = await getOrCreateProgress(userId);
      const normalized = normalizeProgress(body.progress);
      await ddb.send(
        new PutCommand({
          TableName: PROGRESS_TABLE,
          Item: {
            userId,
            activeCourseId: normalized.activeCourseId || DEFAULT_COURSE_ID,
            courses: normalized.courses || defaultCoursesProgress(),
            updatedAt: now,
            createdAt: existing.createdAt || now
          }
        })
      );

      await replaceAllLogs(userId, body.logs);
      return response(200, { ok: true });
    }

    return response(404, { error: `Route not found: ${method} ${path}` });
  } catch (err) {
    return response(500, { error: err.message || "Internal server error" });
  }
};
