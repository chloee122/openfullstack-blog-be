const mongoose = require("mongoose");
const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

const blogInDb = async () => {
  const response = await Blog.find({});
  return response.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({
    title: "willremovethissoon",
    url: "www.example.com",
    author: "Map",
    likes: 12,
  });

  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

module.exports = {
  initialBlogs,
  blogInDb,
  nonExistingId,
};
