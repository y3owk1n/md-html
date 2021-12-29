import { CopyIcon, DeleteIcon, QuestionIcon } from "@chakra-ui/icons";
import {
  AspectRatio,
  Badge,
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  UnorderedList,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import DOMPurify from "dompurify";
import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkDirective from "remark-directive";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

const md = `### This markdown editor is very opinionated and basically created for my own workflow... use it or leave it :smile:

---

1. Automatically adding \`target="_blank"\` for all links.
2. Only support youtube directive as an iframe (e.g.: \`::youtube[video name]{#ID}\`).
3. Ability to \`remove the list-styles\` on ordered and unordered list for my own usage.
4. Main core of this project is to offer a live preview and copy clean copy of generated htmls to another html editor.
5. Contents will be temporarily saved under localstorage for some degree of conveniency.`;

function myRemarkPlugin() {
  return (tree: any, file: any) => {
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        if (node.type === "leafDirective") {
          if (node.name !== "youtube") return;

          const data = node.data || (node.data = {});
          const attributes = node.attributes || {};
          const id = attributes.id;

          if (node.type === "textDirective") return;
          if (!id) return;

          data.hName = "iframe";
          data.hProperties = {
            id: id,
          };
        }
      }
    });
  };
}

const uuid = "vomthe_id";

const Home: NextPage = () => {
  const [value, setValue] = useState<string | undefined>(md);

  const [showHtml, setShowHtml] = useState(false);

  const [noListStyle, setNoListStyle] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    if (localStorage.getItem(uuid)) {
      setValue(localStorage.getItem(uuid) as string);
    }
  }, []);

  useEffect(() => {
    if (!value) {
      localStorage.removeItem(uuid);
    }
  }, [value, noListStyle]);

  const renderComponentToString = (elem: ReactElement) => {
    const dirtyHtml = renderToString(elem);
    return DOMPurify.sanitize(dirtyHtml, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["iframe"],
      ADD_ATTR: [
        "target",
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "title",
        "aria-hidden",
        "srcDoc",
      ],
    });
  };

  const markDownComponent: any = {
    a: ({ ...props }) => (
      <Link color="blue.500" href={props.href} isExternal {...props} />
    ),
    h1: ({ ...props }) => <Heading as={"h1"} size="xl" {...props} my={2} />,
    h2: ({ ...props }) => <Heading as={"h2"} size="lg" {...props} my={2} />,
    h3: ({ ...props }) => <Heading as={"h3"} size="md" {...props} my={2} />,
    p: ({ ...props }) => <Text {...props} my={2} />,
    li: ({ ...props }) => <ListItem {...props} />,
    ol: ({ ...props }) => (
      <OrderedList
        listStyleType={noListStyle ? "none" : undefined}
        marginLeft={noListStyle ? 0 : undefined}
        {...props}
        my={2}
      />
    ),
    ul: ({ ...props }) => (
      <UnorderedList
        listStyleType={noListStyle ? "none" : undefined}
        marginLeft={noListStyle ? 0 : undefined}
        {...props}
        my={2}
      />
    ),
    code: ({ ...props }) => (
      <Code
        {...props}
        w={props.inline ? "unset" : "full"}
        py={props.inline ? 0 : 2}
        px={1}
        colorScheme={"red"}
      />
    ),
    img: ({ ...props }) => (
      <Image
        alt={props.alt}
        src={props.src}
        title={props.title}
        {...props}
        my={2}
      />
    ),
    hr: ({ ...props }) => <Divider my={4} {...props} />,
    table: ({ ...props }) => <Table {...props} />,
    tbody: ({ ...props }) => <Tbody {...props} />,
    td: ({ ...props }: any) => <Td {...props} />,
    th: ({ ...props }: any) => <Th {...props} />,
    thead: ({ ...props }) => <Thead {...props} />,
    tr: ({ ...props }) => <Tr {...props} />,
    iframe: ({ ...props }) => (
      <AspectRatio ratio={16 / 9}>
        <Box
          as={"iframe"}
          src={"https://www.youtube.com/embed/" + props.id}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={props.children}
          aria-hidden="true"
          frameBorder="0"
          allowFullScreen
          srcDoc={`<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/${props.id}/?autoplay=1><img src=https://img.youtube.com/vi/${props.id}/hqdefault.jpg alt='${props.children}'><span>▶</span></a>`}
        />
      </AspectRatio>
    ),
  };

  const htmlComponent: any = {
    a: ({ ...props }) => (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    ul: ({ ...props }) => (
      <ul
        style={noListStyle ? { listStyle: "none", marginLeft: 0 } : undefined}
        {...props}
      />
    ),
    ol: ({ ...props }) => (
      <ul
        style={noListStyle ? { listStyle: "none", marginLeft: 0 } : undefined}
        {...props}
      />
    ),
    iframe: ({ ...props }) => (
      <div
        style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}
      >
        <iframe
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          title={props.children}
          src={"https://www.youtube.com/embed/" + props.id}
          frameBorder="0"
          allowFullScreen
          aria-hidden="true"
          srcDoc={`<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/${props.id}/?autoplay=1><img src=https://img.youtube.com/vi/${props.id}/hqdefault.jpg alt='${props.children}'><span>▶</span></a>`}
        />
      </div>
    ),
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    localStorage.setItem(uuid, e.target.value);
  };

  const copyToClipboard = (html: string, isHtml: boolean) => {
    navigator.clipboard.writeText(html);
    toast({
      title: "Success",
      description: `${isHtml ? "HTML" : "Markdown"} copied succesfully!`,
      status: "success",
      duration: 5000,
    });
  };

  return (
    <Box bg="gray.100">
      <Head>
        <title>Very Opinionated Markdown To HTML | Kyle</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Grid
        h="100vh"
        padding={5}
        templateColumns={["repeat(1, 1fr)", null, "repeat(2, 1fr)"]}
        templateRows={["repeat(2, 1fr)", null, "repeat(1, 1fr)"]}
        gridGap={5}
        overflowY={"auto"}
      >
        <Flex flexDir={"column"} minH="full">
          <Flex justifyContent="space-between" my={2}>
            <Heading fontSize={"2xl"}>Markdown Input</Heading>
            <Flex alignItems={"center"}>
              <Tooltip hasArrow label="Click to copy Markdown">
                <IconButton
                  size="xs"
                  variant="outline"
                  colorScheme={"blue"}
                  mr={2}
                  aria-label="copy"
                  icon={<CopyIcon />}
                  disabled={!value}
                  onClick={() => copyToClipboard(value ?? "", false)}
                />
              </Tooltip>
              <Tooltip hasArrow label="Click to delete all Markdowns">
                <IconButton
                  size="xs"
                  variant="outline"
                  colorScheme={"red"}
                  mr={2}
                  aria-label="delete"
                  icon={<DeleteIcon />}
                  disabled={!value}
                  onClick={() => setValue("")}
                />
              </Tooltip>
            </Flex>
          </Flex>
          <Textarea
            value={value}
            onChange={handleChange}
            h="full"
            bg="white"
            shadow="md"
            p={5}
            resize={"none"}
            border={"none"}
          />
        </Flex>
        <Flex flexDir={"column"} h="full" overflowY={"auto"}>
          <Flex justifyContent="space-between" my={2}>
            <Heading fontSize={"2xl"}>
              {showHtml ? "HTML Code" : "Live Preview"}
            </Heading>
            <Flex alignItems={"center"}>
              <Tooltip
                hasArrow
                label={
                  showHtml
                    ? "Click to see live preview"
                    : "Click to see HTML code view"
                }
              >
                <Button
                  variant={"outline"}
                  colorScheme={"blue"}
                  onClick={() => setShowHtml(!showHtml)}
                  mr={2}
                  size={"xs"}
                >
                  {showHtml ? "Live" : "Code"}
                </Button>
              </Tooltip>
              <Tooltip
                hasArrow
                label={
                  noListStyle
                    ? "Click to show bullets"
                    : "Click to unshow bullets"
                }
              >
                <Button
                  variant={"outline"}
                  colorScheme={"blue"}
                  onClick={() => setNoListStyle(!noListStyle)}
                  mr={2}
                  size="xs"
                >
                  {noListStyle ? "✅ ∙" : "❎ ∙"}
                </Button>
              </Tooltip>
              <Tooltip hasArrow label="Click to copy HTML">
                <IconButton
                  size="xs"
                  variant="outline"
                  colorScheme={"blue"}
                  mr={2}
                  aria-label="copy"
                  icon={<CopyIcon />}
                  disabled={!showHtml}
                  onClick={() =>
                    copyToClipboard(
                      renderComponentToString(
                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                            [emoji, { padSpaceAfter: true }],
                            remarkDirective,
                            myRemarkPlugin,
                          ]}
                          components={htmlComponent}
                        >
                          {value as string}
                        </ReactMarkdown>
                      ),
                      true
                    )
                  }
                />
              </Tooltip>
              <Tooltip hasArrow label="Help with markdown syntax">
                <IconButton
                  size="xs"
                  variant="outline"
                  colorScheme={"blue"}
                  aria-label="help"
                  icon={<QuestionIcon />}
                  onClick={onOpen}
                />
              </Tooltip>
            </Flex>
          </Flex>
          <Box
            bg="white"
            shadow="md"
            rounded="md"
            p={5}
            overflowY="auto"
            h="full"
          >
            <Box>
              {showHtml ? (
                <SyntaxHighlighter wrapLines wrapLongLines language="html">
                  {renderComponentToString(
                    <ReactMarkdown
                      remarkPlugins={[
                        remarkGfm,
                        [emoji, { padSpaceAfter: true }],
                        remarkDirective,
                        myRemarkPlugin,
                      ]}
                      components={htmlComponent}
                    >
                      {value as string}
                    </ReactMarkdown>
                  )}
                </SyntaxHighlighter>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                    [emoji, { padSpaceAfter: true }],
                    remarkDirective,
                    myRemarkPlugin,
                  ]}
                  components={markDownComponent}
                >
                  {value as string}
                </ReactMarkdown>
              )}
            </Box>
          </Box>
        </Flex>
      </Grid>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Helper</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Elements</Th>
                  <Th>Markdown Syntax</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td verticalAlign={"top"}>Heading</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        # H1
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        ## H2
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        ### H3
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Bold</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        **bold text**
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Italic</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        *italic text*
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Strikethrough</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        ~strikethrough~
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Ordered List</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        1. First item
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        2. Second item
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        3. Third item
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Unordered List</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        - First item
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        - Second item
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        - Third item
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Horizontal Rule</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        ---
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Link</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        [title](https://www.example.com)
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>Image</Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        ![alt text](image.jpg)
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>
                    YouTube Video <Badge colorScheme={"blue"}>New</Badge>
                  </Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        {"::youtube[Name]{#ID}"}
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign={"top"}>
                    Emoji <Badge colorScheme={"blue"}>New</Badge>
                  </Td>
                  <Td>
                    <Flex flexDir={"column"} experimental_spaceY={2}>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        :wink:
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        :dog:
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        :+1
                      </Code>
                      <Code colorScheme={"red"} maxW={"fit-content"}>
                        :point_up:
                      </Code>
                    </Flex>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;
