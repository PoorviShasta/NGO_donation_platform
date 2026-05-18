const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");

const storage = multer.memoryStorage();

const upload = multer({ storage });

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

module.exports = { upload, containerClient };