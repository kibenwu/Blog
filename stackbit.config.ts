import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  contentSources: [
    new GitContentSource({
      rootPath: __dirname, // 项目根目录
      contentDirs: ["content"], // 内容文件夹
      models: [
        {
          name: "Page",
          type: "page",
          label: "Page",
          urlPath: "/{slug}", // 动态 URL 路径
          filePath: "content/pages/{slug}.json", // 页面内容存储路径
          fields: [
            { name: "title", type: "string", label: "Title", required: true }, // 页面标题
            { name: "content", type: "markdown", label: "Content" }, // 正文内容
          ],
        },
        {
          name: "Post",
          type: "data", // 数据模型
          label: "Blog Post",
          urlPath: "/blog/{slug}", // 博客页面 URL
          filePath: "content/posts/{slug}.json", // 博客内容存储路径
          fields: [
            { name: "title", type: "string", label: "Title", required: true }, // 博客标题
            { name: "date", type: "date", label: "Publish Date", required: true }, // 发布时间
            { name: "body", type: "markdown", label: "Body" }, // 博客正文
          ],
        },
        {
          name: "Other",
          type: "data", // 额外数据模型
          label: "Other Content",
          urlPath: "/other/{slug}", // 自定义内容的 URL 路径
          filePath: "content/others/{slug}.json", // 其他内容存储路径
          fields: [
            { name: "title", type: "string", label: "Title", required: true }, // 标题
            { name: "description", type: "string", label: "Description" }, // 简短描述
          ],
        },
      ],
    }),
  ],
  siteMap: ({ documents, models }) => {
    // 1. 筛选所有页面模型
    const pageModels = models.filter((m) => m.type === "page");

    return documents
      // 2. 筛选所有与页面模型匹配的文档
      .filter((d) => pageModels.some((m) => m.name === d.modelName))
      // 3. 将每个文档映射为 SiteMapEntry
      .map((document) => {
        const urlModel = (() => {
          switch (document.modelName) {
            case "Page":
              return "otherPage"; // 自定义 Page 模型的 URL 前缀
            case "Post":
              return "otherBlog"; // 自定义 Blog 模型的 URL 前缀
            default:
              return null;
          }
        })();

        return {
          stableId: document.id, // 文档唯一标识
          urlPath: `/${urlModel}/${document.id}`, // 自定义 URL 路径
          document,
          isHomePage: false, // 是否为首页
        };
      })
      .filter(Boolean) as SiteMapEntry[];
  },
});
