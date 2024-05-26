const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");

const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const helper = require("./test_helpers");

const api = supertest(app);

// beforeEach(async () => {
//   await Blog.deleteMany({});
//   for (const blog of helper.initialBlogs) {
//     const newBlog = new Blog(blog);
//     await newBlog.save();
//   }
// });

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("notes are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("notes are returned in the correct amount", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

describe("get a blog by its id", () => {
  test("the unique identifier is named id", async () => {
    const response = await api.get("/api/blogs");

    assert(response.body.every((blog) => blog.id));
  });

  test("fail with status code 404 if the id is invalid", async () => {
    const invalidId = await helper.nonExistingId();

    await api.get(`/api/blogs/${invalidId}`).expect(404);
  });
});

describe("addition of a new note", () => {
  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    assert(response.body.length, helper.initialBlogs.length + 1);

    const contents = response.body.map((blog) => blog.title);
    assert(contents.includes("Canonical string reduction"));
  });

  test("added blog's likes is 0 if it is missing from the request", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    assert(response.body.some((blog) => blog.likes === 0));
  });

  test("fail with status code 400 if title or url properties are missing", async () => {
    const blogWithoutTitle = {
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api.post("/api/blogs").send(blogWithoutTitle).expect(400);
  });
});

describe("deletion of a note", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogInDb();

    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogInDb();
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);

    const titles = blogsAtEnd.map((blog) => blog.title);
    assert(!titles.includes(blogToDelete.title));
  });
});

describe("update of a note", () => {
  test("succeeds and return the updated blog object", async () => {
    const blogAtStart = await helper.blogInDb();
    const blogToUpdate = blogAtStart[0];
    const updatedLikes = 1000;
    const updatedBlog = { ...blogToUpdate, likes: updatedLikes };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog);

    assert.strictEqual(response.body.likes, updatedLikes);
  });
});

after(async () => {
  await mongoose.connection.close();
});
