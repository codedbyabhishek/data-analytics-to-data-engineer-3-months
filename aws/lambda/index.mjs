import { randomUUID } from "node:crypto";
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

const WEEK_IDS = Array.from({ length: 13 }, (_, i) => i);

function defaultCompletedWeeks() {
  const completed = {};
  for (const id of WEEK_IDS) {
    completed[id] = false;
  }
  return completed;
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
    goalWeeklyHours: 20,
    completedWeeks: defaultCompletedWeeks(),
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

async function listLogs(userId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: LOGS_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    })
  );

  const logs = (result.Items || []).sort((a, b) => (a.logDate < b.logDate ? 1 : -1));
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
    const { userId, email } = getUser(event);

    if (method === "GET" && path === "/profile") {
      const profile = await getOrCreateProfile(userId, email);
      return response(200, profile);
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
      return response(200, progress);
    }

    if (method === "PUT" && path === "/progress") {
      const body = JSON.parse(event.body || "{}");
      const goalWeeklyHours = Number(body.goalWeeklyHours || 20);
      const completedWeeks = body.completedWeeks || defaultCompletedWeeks();
      const now = new Date().toISOString();

      await ddb.send(
        new PutCommand({
          TableName: PROGRESS_TABLE,
          Item: {
            userId,
            goalWeeklyHours,
            completedWeeks,
            updatedAt: now,
            createdAt: now
          }
        })
      );

      const progress = await getOrCreateProgress(userId);
      return response(200, progress);
    }

    if (method === "GET" && path === "/logs") {
      const logs = await listLogs(userId);
      return response(200, { logs });
    }

    if (method === "POST" && path === "/logs") {
      const body = JSON.parse(event.body || "{}");
      const log = {
        userId,
        id: randomUUID(),
        logDate: body.logDate,
        weekNo: Number(body.weekNo),
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
      if (!body?.progress?.completedWeeks || !Array.isArray(body.logs)) {
        return response(400, { error: "Invalid import payload" });
      }

      const now = new Date().toISOString();
      await ddb.send(
        new PutCommand({
          TableName: PROGRESS_TABLE,
          Item: {
            userId,
            goalWeeklyHours: Number(body.progress.goalWeeklyHours || 20),
            completedWeeks: body.progress.completedWeeks,
            updatedAt: now,
            createdAt: now
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
