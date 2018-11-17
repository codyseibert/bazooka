const { upload } = require("./upload");
const applicationContext = require("../applicationContext");
const path = require("path");
const fs = require("fs");

describe("upload", () => {
  const filePath = path.join(__dirname, "../../fixtures/bazooka.zip");
  let file;
  let bazooka;
  let lastPublishEvent;

  beforeAll(async () => {
    await applicationContext.bus.subscribe({
      key: "upload",
      cb: event => {
        lastPublishEvent = event;
      }
    });
    file = fs.readFileSync(filePath);
    bazooka = await upload({
      applicationContext,
      filePath
    });
  });

  it("should store the file", async () => {
    const fileStored = await applicationContext.persistence.fetch({
      key: bazooka.hash
    });
    expect(fileStored.compare(file)).toBe(0);
  });

  it("should save the bazooka json", async () => {
    const bazookaSaved = await applicationContext.persistence.get({
      key: bazooka.key
    });
    expect(bazookaSaved).toEqual(bazooka);
  });

  it("should publish an event", () => {
    expect(lastPublishEvent).toEqual(bazooka.key);
  });

  it("should delete the extracted folder", () => {
    const fileExists = fs.existsSync(path.join(filePath, "_dir"));
    expect(fileExists).toBe(false);
  });
});
