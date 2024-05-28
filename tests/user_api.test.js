const { test, beforeEach, after, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const helper = require("./test_helpers");
const bcrypt = require("bcrypt");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany();

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({
      username: "root",
      passwordHash,
    });

    await user.save();
  });

  describe("get all user", () => {
    test("users are returned in the correct amount", async () => {
      const usersAtStart = await helper.userInDb();

      const returnedUsers = await api.get("/api/users");
      assert.strictEqual(returnedUsers.body.length, usersAtStart.length);
    });

    test("users are returned as json", async () => {
      await api
        .get("/api/users")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });
  });

  describe("creation of a user", () => {
    test("creation succeeds with a fresh username", async () => {
      
      const usersAtStart = await helper.userInDb();

      const newUser = {
        username: "CinamonBun",
        name: "Chloe",
        password: "secret",
      };

      const returnedUser = await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.userInDb();
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);

      assert(usernames.includes(returnedUser.body.username));
    });

    test("creation fails with proper statuscode and message if username already taken", async () => {
      const usersAtStart = await helper.userInDb();

      const newUser = {
        username: "root",
        name: "Superuser",
        password: "salainen",
      };

      const response = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      assert(response.body.error.includes("expected `username` to be unique"));

      const usersAtEnd = await helper.userInDb();
      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if password is less than 3 character", async () => {
      const usersAtStart = await helper.userInDb();

      const newUser = {
        username: "validationTest",
        name: "test",
        password: "hi",
      };

      const response = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      assert(
        response.body.error.includes(
          "expected `password` to be at least 3 characters long"
        )
      );
      const usersAtEnd = await helper.userInDb();
      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });
  });

  test("creation fails with proper statuscode and message if username is less than 3 character", async () => {
    const usersAtStart = await helper.userInDb();

    const newUser = {
      username: "hi",
      name: "test",
      password: "test",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.userInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
