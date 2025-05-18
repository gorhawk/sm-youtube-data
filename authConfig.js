export const msalConfig = {
  auth: {
    clientId: "ef50611d-7581-4943-b9fe-3e893c2a7005", // "sm_youtube_data" app from Azure
    authority:
      "https://login.microsoftonline.com/a2000560-ea4b-4f9a-b537-fd0e3e0142b8", // tenant ID from Azure
    redirectUri:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : "https://supermanagement.github.io/platform-data/",
  },
};

export const loginRequest = {
  scopes: [
    "User.Read", // Basic login info
    "Files.Read", // Only allows access to user-owned/shared files
    "offline_access", // For refresh tokens (optional)
  ],
};
