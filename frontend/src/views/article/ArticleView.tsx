import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox as MuiCheckbox,
  Link as MuiLink,
} from "@mui/material";

import {
  getArticleArticlesArticleIdGet,
  listUsersUsersGet,
} from "../../client/sdk.gen";

import type { ArticleRead, UserRead } from "../../client/types.gen";

const mdComponents = {
  // block-level headings and paragraphs -> MUI Typography with correct variants
  h1: ({ node, ...props }: any) => <Typography variant="h3" gutterBottom {...props} />,
  h2: ({ node, ...props }: any) => <Typography variant="h4" gutterBottom {...props} />,
  h3: ({ node, ...props }: any) => <Typography variant="h5" gutterBottom {...props} />,
  p: ({ node, ...props }: any) => <Typography paragraph {...props} />,
  // links -> MUI Link but keep react-router links if needed
  a: ({ href, children, ...props }: any) =>
    href?.startsWith("/") ? (
      <MuiLink component={RouterLink} to={href} {...props}>{children}</MuiLink>
    ) : (
      <MuiLink href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</MuiLink>
    ),
  // images -> responsive Box/img
  img: ({ src, alt, ...props }: any) => (
    <Box component="img" src={src} alt={alt} sx={{ maxWidth: "100%", borderRadius: 2 }} {...props} />
  ),
  // inline code and code blocks
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return <Box component="code" sx={{ bgcolor: "action.hover", px: "4px", borderRadius: 1 }} {...props}>{children}</Box>;
    }
    // block code: className like "language-js"
    return (
      <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
        <Box component="pre" sx={{ m: 0 }}>
          <code className={className} {...props}>{children}</code>
        </Box>
      </Paper>
    );
  },
  // tables -> MUI Table components
  table: ({ children, ...props }: any) => <MuiTable size="small" {...props}>{children}</MuiTable>,
  thead: ({ children, ...props }: any) => <TableHead {...props}>{children}</TableHead>,
  tbody: ({ children, ...props }: any) => <TableBody {...props}>{children}</TableBody>,
  tr: ({ children, ...props }: any) => <TableRow {...props}>{children}</TableRow>,
  th: ({ children, ...props }: any) => <TableCell sx={{ fontWeight: "bold" }} {...props}>{children}</TableCell>,
  td: ({ children, ...props }: any) => <TableCell {...props}>{children}</TableCell>,
  // task list checkboxes (from remark-gfm)
  input: ({ type, checked, ...props }: any) => {
    if (type === "checkbox") {
      return <MuiCheckbox checked={checked} disableRipple size="small" {...props} />;
    }
    return <input type={type} {...props} />;
  },
  // blockquote
  blockquote: ({ children, ...props }: any) => (
    <Box component="blockquote" sx={{ borderLeft: 2, pl: 2, color: "text.secondary", ml: 0 }} {...props}>
      {children}
    </Box>
  ),
};

export default function ArticleView() {
  const { id } = useParams();

  const [article, setArticle] = useState<ArticleRead | null>(null);
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [articleRes, usersRes] = await Promise.all([
          getArticleArticlesArticleIdGet({
            path: { article_id: id },
            throwOnError: true,
          }),
          listUsersUsersGet({ throwOnError: true }),
        ]);

        const articleData = (articleRes as any)?.data ?? articleRes;
        const usersData = (usersRes as any)?.data ?? usersRes;

        setArticle(articleData);
        setUsers(usersData ?? []);
      } catch {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">
          {error ?? "Article not found"}
        </Typography>
      </Box>
    );
  }

  const author = userMap.get(article.creator_id);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box sx={{ position: "relative", height: 320, overflow: "hidden" }}>
        {article.background_image && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(http://localhost:8000/images/${article.background_image.id}/raw)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.2)",
            }}
          />
        )}

        {/* dark overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />

        {/* PRIMARY IMAGE */}
        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {article.primary_image && (
            <Box
              component="img"
              src={`http://localhost:8000/images/${article.primary_image.id}/raw`}
              sx={{
                maxHeight: 500,
                maxWidth: "90%",
                borderRadius: 2,
                boxShadow: 6,
              }}
            />
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, px: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {article.display_name}
          </Typography>

          {/* metadata, edit button */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created {new Date(article.created_at).toLocaleString()}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Updated {new Date(article.updated_at).toLocaleString()}
            </Typography>

          </Stack>

          <Button component={RouterLink} to={`/articles/${article.id}/edit`} variant="outlined">
            Edit Article
          </Button>

          {/* author */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, mt: 2 }}>
            <Avatar
              src={
                author?.avatar
                  ? `http://localhost:8000/images/${author.avatar.id}/raw`
                  : undefined
              }
              sx={{ width: 28, height: 28 }}
            >
              {author?.username?.[0]?.toUpperCase()}
            </Avatar>

            {author ? (
              <Typography variant="body2">
                <RouterLink to={`/users/${author.id}`}>
                  {author.display_name}
                </RouterLink>
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Unknown author
              </Typography>
            )}
          </Stack>

          {/* text */}
          <Box>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {article.text}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
