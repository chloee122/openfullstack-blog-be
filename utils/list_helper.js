const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const total = blogs.reduce((acc, cur) => acc + cur.likes, 0);
  return total;
};

const favoriteBlog = (blogs) => {
  let highestLikes = blogs[0].likes;

  let favoriteBlog;
  blogs.forEach((blog) => {
    if (blog.likes >= highestLikes) {
      favoriteBlog = blog;
      highestLikes = blog.likes;
    }
  });
  return favoriteBlog;
};

const mostBlogs = (blogs) => {
  let mostBlogs = { author: "", blogs: 0 };
  for (i = 0; i < blogs.length; i++) {
    const blogCounts = blogs.filter(
      (blog) => blog.author === blogs[i].author
    ).length;

    if (blogCounts >= mostBlogs.blogs) {
      mostBlogs.author = blogs[i].author;
      mostBlogs.blogs = blogCounts;
    }
  }
  return mostBlogs;
};

const mostLikes = (blogs) => {
  let mostLikes = { author: "", likes: 0 };
  for (i = 0; i < blogs.length; i++) {
    const likeCounts = blogs.reduce((acc, cur) => {
      console.log(cur.author === blogs[i].author);
      if (cur.author === blogs[i].author) {
        return acc + cur.likes;
      } else {
        return acc;
      }
    }, 0);
    console.log(likeCounts);
    if (likeCounts >= mostLikes.likes) {
      mostLikes.author = blogs[i].author;
      mostLikes.likes = likeCounts;
    }
  }
  return mostLikes;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
