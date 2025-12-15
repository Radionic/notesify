export type NotificationMessage =
  | {
      type: "user-register";
      name?: string | null;
      email?: string | null;
    }
  | {
      [key: string]: unknown;
    };

export const sendMessage = async (message: NotificationMessage) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const content = (() => {
    if (message.type === "user-register") {
      return `New user registered!\nName: ${message.name}\nEmail: ${message.email}`;
    }

    return JSON.stringify(message);
  })();

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (!response.ok) {
    console.error(`Failed to send Discord message: ${response.status}`);
  }
};
