import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/atom-one-dark.css";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

type ChatCompletionMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function CodeChat({
  messages,
}: {
  messages: ChatCompletionMessage[];
}) {
  return (
    <div className="flex flex-col-reverse gap-y-4">
      {/*   TODO: Put on server for lag-reducing   */}
      {messages?.map(message => (
        <div
          key={message.content}
          className={cn(
            "p-8 w-full flex items-start gap-x-8 rounded-lg",
            message.role === "user"
              ? "bg-white border border-black/10"
              : "bg-muted"
          )}
        >
          {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
          <ReactMarkdown
            // @ts-ignore
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto w-full my-2 bg-[#282c34] p-2 rounded-lg">
                  <pre {...props} />
                </div>
              ),
            }}
            className="text-sm overflow-hidden leading-7"
          >
            {message.content || ""}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
