const withImages = require("next-images");
const withTM = require("next-transpile-modules")(["@madzadev/image-slider"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withImages(withTM(nextConfig));
