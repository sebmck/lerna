/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // main: [{ type: "autogenerated", dirName: "." }],

  // But you can create a sidebar manually
  main: [
    "introduction",
    "getting-started",
    {
      type: "category",
      label: "Features",
      items: [
        "features/bootstrap",
        "features/run-tasks",
        "features/version-and-publish",
        "features/cache-tasks",
        "features/distribute-tasks",
      ],
      link: {
        type: "generated-index",
        title: "How To Guides",
        description: "Get Started",
        slug: "/features",
      },
    },
    {
      type: "category",
      label: "Concepts",
      items: ["concepts/hoisting"],
      link: {
        type: "generated-index",
        title: "Concepts",
        description: "Get a higher level understanding of concepts used in Lerna",
        slug: "/concepts",
        keywords: ["caching", "dte", "versioning", "publishing"],
      },
    },
    {
      type: "category",
      label: "API Reference",
      items: ["api-reference/commands", "api-reference/filter-options", "api-reference/configuration"],
    },
    {
      type: "doc",
      label: "FAQ",
      id: "faq",
    },
    "troubleshooting",
  ],
};

module.exports = sidebars;
