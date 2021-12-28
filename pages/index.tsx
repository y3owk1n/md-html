import { CopyIcon, QuestionIcon } from "@chakra-ui/icons";
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
  Tr,
  UnorderedList,
  useDisclosure,
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

const md = `
Type in **markdown** and copy in html ->

---

🙃
`;

const Home: NextPage = () => {
  const [value, setValue] = useState<string | undefined>(
    typeof window !== "undefined" ? localStorage.getItem("md") ?? md : md
  );

  const [cleanHtml, setCleanHtml] = useState("");

  const [formattedHtml, setFormattedHtml] = useState("");

  const [showHtml, setShowHtml] = useState(false);

  const [noListStyle, setNoListStyle] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    if (!value) {
      setCleanHtml("");
      setFormattedHtml("");
      localStorage.removeItem("md");
    }

    const dirtyHtml =
      document.querySelector(".markdown")?.innerHTML.toString() || "";
    setCleanHtml(
      DOMPurify.sanitize(dirtyHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"],
      })
    );

    const dirtyFormattedHtml =
      document.querySelector(".html")?.innerHTML.toString() || "";
    setFormattedHtml(
      DOMPurify.sanitize(dirtyFormattedHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"],
      })
    );

    return () => {
      setCleanHtml("");
      setFormattedHtml("");
    };
  }, [value, noListStyle]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    localStorage.setItem("md", e.target.value);
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
              a: ({ href, ...props }) => (
                <Link color="blue.500" href={href} isExternal {...props} />
              ),
              h1: ({ level, ...props }) => (
                <Heading as={"h1"} size="xl" {...props} my={2} />
              ),
              h2: ({ level, ...props }) => (
                <Heading as={"h2"} size="lg" {...props} my={2} />
              ),
              h3: ({ level, ...props }) => (
                <Heading as={"h3"} size="md" {...props} my={2} />
              ),
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
              hr: ({ ...props }) => <Divider my={4} {...props} />,
              table: ({ ...props }) => <Table {...props} />,
              tbody: ({ ...props }) => <Tbody {...props} />,
              td: ({ ...props }: any) => <Td {...props} />,
              th: ({ ...props }: any) => <Th {...props} />,
              thead: ({ ...props }) => <Thead {...props} />,
              tr: ({ ...props }) => <Tr {...props} />,
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
              a: ({ href, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul
                  style={
                    noListStyle
                      ? { listStyle: "none", marginLeft: 0 }
                      : undefined
                  }
                  {...props}
                />
              ),
              ol: ({ ...props }) => (
                <ul
                  style={
                    noListStyle
                      ? { listStyle: "none", marginLeft: 0 }
                      : undefined
                  }
                  {...props}
                />
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
        <Box>
          <Textarea
            value={value}
            onChange={handleChange}
            h="100%"
            bg="white"
            shadow="md"
            p={5}
            resize={"none"}
            border={"none"}
          />
        </Box>
        <Box bg="white" shadow="md" rounded="md" p={5} overflowY="auto">
          <Flex justifyContent="space-between">
            <Heading>Results:</Heading>
            <Flex>
              <Button
                variant={"outline"}
                colorScheme={"blue"}
                onClick={() => setShowHtml(!showHtml)}
                mr={2}
              >
                {showHtml ? "Live" : "Code"}
              </Button>
              <Button
                variant={"outline"}
                colorScheme={"blue"}
                onClick={() => setNoListStyle(!noListStyle)}
                mr={2}
              >
                {noListStyle ? "Show Bullet" : "No Bullet"}
              </Button>
              <IconButton
                variant="outline"
                colorScheme={"blue"}
                mr={2}
                aria-label="copy"
                icon={<CopyIcon />}
                disabled={!showHtml}
                onClick={() => copyToClipboard(formattedHtml)}
              />
              <IconButton
                variant="outline"
                colorScheme={"blue"}
                aria-label="help"
                icon={<QuestionIcon />}
                onClick={onOpen}
              />
            </Flex>
          </Flex>
          <Divider my={2} />
          <Box>
            {showHtml ? (
              <SyntaxHighlighter wrapLines wrapLongLines language="html">
                {formattedHtml}
              </SyntaxHighlighter>
            ) : (
              parse(cleanHtml)
            )}
          </Box>
        </Box>
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
