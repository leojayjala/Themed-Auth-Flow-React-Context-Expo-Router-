const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Metro sometimes receives stack frames with `file: "<anonymous>"` (common on web),
// then tries to read a non-existent file to build a code-frame and spams ENOENT.
// Sanitize those frames before Metro symbolicates them.
config.server = config.server ?? {};
const previousEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  const baseMiddleware = previousEnhanceMiddleware ? previousEnhanceMiddleware(middleware, server) : middleware;

  return (req, res, next) => {
    try {
      if (req?.url?.startsWith("/symbolicate") && !("rawBody" in req)) {
        req.rawBody = new Promise((resolve) => {
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed && Array.isArray(parsed.stack)) {
                parsed.stack = parsed.stack.map((frame) => {
                  if (frame && typeof frame === "object" && frame.file === "<anonymous>") {
                    return { ...frame, file: "", lineNumber: null, column: 0 };
                  }
                  return frame;
                });
              }
              resolve(JSON.stringify(parsed));
            } catch {
              resolve(data);
            }
          });
          req.on("error", () => resolve(data));
        });
      }
    } catch {
      // ignore
    }

    return baseMiddleware(req, res, next);
  };
};

module.exports = config;

