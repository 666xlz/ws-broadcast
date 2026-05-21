const clients = new Set();

export default {
  async fetch(request) {
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response("Not found", { status: 404 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);
    clients.add(socket);

    // 消息广播（不发给自己，稳定不崩溃）
    socket.onmessage = (e) => {
      for (const client of clients) {
        if (client === socket) continue; // 不发给自己 ✅
        if (client.readyState === 1) {
          try {
            client.send(e.data);
          } catch {}
        }
      }
    };

    // 断开连接清理
    socket.onclose = () => {
      clients.delete(socket);
    };

    // 出错清理
    socket.onerror = () => {
      clients.delete(socket);
    };

    return response;
  }
};
