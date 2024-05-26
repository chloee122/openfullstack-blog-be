const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const blogObj = request.body;

  const blog = new Blog({
    title: blogObj.title,
    author: blogObj.author,
    url: blogObj.url,
    likes: blogObj.likes || 0,
  });

  const result = await blog.save();
  response.status(201).json(result);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const updatedBlogObj = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedBlogObj,
    { new: true }
  );
  response.json(updatedBlog);
});

module.exports = blogsRouter;
