import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Code,
  Divider,
  Flex,
  Grid,
  Heading,
  IconButton,
  Image,
  Link,
  ListItem,
  OrderedList,
  Text,
  Textarea,
  UnorderedList,
  useToast,
  VisuallyHidden,
} from "@chakra-ui/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import type { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";

const Home: NextPage = () => {
  const [value, setValue] = useState<string | undefined>(
    "Type something **here** to start!"
  );

  const [cleanHtml, setCleanHtml] = useState("");

  const [formattedHtml, setFormattedHtml] = useState("");

  const [showHtml, setShowHtml] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (!value) {
      setCleanHtml("");
      setFormattedHtml("");
    }

    const dirtyHtml =
      document.querySelector(".markdown")?.innerHTML.toString() || "";
    setCleanHtml(
      DOMPurify.sanitize(dirtyHtml, {
        USE_PROFILES: { html: true },
      })
    );

    const dirtyFormattedHtml =
      document.querySelector(".html")?.innerHTML.toString() || "";
    setFormattedHtml(
      DOMPurify.sanitize(dirtyFormattedHtml, {
        USE_PROFILES: { html: true },
      })
    );

    return () => {
      setCleanHtml("");
      setFormattedHtml("");
    };
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const copyToClipboard = (html: string) => {
    navigator.clipboard.writeText(html);
    toast({
      title: "Success",
      description: "Html copied succesfully!",
      status: "success",
      duration: 5000,
    });
  };

  return (
    <Box bg="gray.100">
      <VisuallyHidden>
        <Box>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="markdown"
            components={{
              // Map `h1` (`# heading`) to use `h2`s.
              // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
              a: ({ href, ...props }) => (
                <Link color="blue.500" href={href} isExternal {...props} />
              ),
              h1: ({ level, ...props }) => (
                <Heading as={"h1"} size="xl" {...props} />
              ),
              h2: ({ level, ...props }) => (
                <Heading as={"h2"} size="lg" {...props} />
              ),
              h3: ({ level, ...props }) => (
                <Heading as={"h2"} size="md" {...props} />
              ),
              p: ({ ...props }) => <Text {...props} my={2} />,
              li: ({ ...props }) => <ListItem {...props} />,
              ol: ({ ...props }) => <OrderedList {...props} />,
              ul: ({ ...props }) => <UnorderedList {...props} />,
              code: ({ inline, ...props }) => (
                <Code
                  {...props}
                  w={inline ? "unset" : "full"}
                  py={inline ? 0 : 2}
                  px={1}
                  colorScheme={"red"}
                />
              ),
              img: ({ src, title, alt, ...props }) => (
                <Image alt={alt} src={src} title={title} {...props} my={2} />
              ),
            }}
          >
            {value as string}
          </ReactMarkdown>
        </Box>
        <Box>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="html"
            components={{
              // Map `h1` (`# heading`) to use `h2`s.
              // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
              a: ({ href, ...props }) => (
                <a href={href} target="_blank" rel="noreferrer" {...props} />
              ),
            }}
          >
            {value as string}
          </ReactMarkdown>
        </Box>
      </VisuallyHidden>
      <Grid
        h="100vh"
        padding={5}
        templateColumns={["repeat(1, 1fr)", null, "repeat(2, 1fr)"]}
        templateRows={["repeat(2, 1fr)", null, "repeat(1, 1fr)"]}
        gridGap={5}
        overflowY={"auto"}
      >
        <Box colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 2, md: 1 }}>
          <Textarea
            value={value}
            onChange={handleChange}
            h="100%"
            bg="white"
            shadow="md"
            p={5}
            resize={"none"}
          />
        </Box>
        <Box
          bg="white"
          shadow="md"
          rounded="md"
          p={5}
          overflowY="auto"
          colSpan={{ base: 1, md: 2 }}
          rowSpan={{ base: 2, md: 1 }}
        >
          <Flex justifyContent="space-between">
            <Heading>Results:</Heading>
            <Flex>
              <Button
                variant={"outline"}
                colorScheme={"blue"}
                onClick={() => setShowHtml(!showHtml)}
                mr={2}
              >
                {showHtml ? "View Actual" : "View Html"}
              </Button>
              <IconButton
                variant="outline"
                colorScheme={"blue"}
                aria-label="copy"
                icon={<CopyIcon />}
                disabled={!showHtml}
                onClick={() => copyToClipboard(cleanHtml)}
              />
            </Flex>
          </Flex>
          <Divider my={2} />
          {showHtml ? (
            <SyntaxHighlighter language="html">
              {formattedHtml}
            </SyntaxHighlighter>
          ) : (
            parse(cleanHtml)
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Home;
