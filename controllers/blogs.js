const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const middleware = require("../utils/middlewares");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const blogObj = request.body;

  // const user = await User.findById(decodedToken.id);
  const user = request.user;
  // const user = await User.findOne({});

  const blog = new Blog({
    title: blogObj.title,
    author: blogObj.author,
    url: blogObj.url,
    likes: blogObj.likes || 0,
    user: user.id,
  });
  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;

    const blog = await Blog.findById(request.params.id);

    if (user.id.toString() === blog.user.toString()) {
      await Blog.findByIdAndDelete(request.params.id);
      response.status(204).end();
    } else {
      response.status(401).json({ error: "only owner can delete blogs" });
    }
  }
);

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
