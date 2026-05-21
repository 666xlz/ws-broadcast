const clients = new Set();

export default {
  async fetch(request) {
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response("WebSocket only", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    clients.add(server);

    server.onmessage = (e) => {
      clients.forEach(c => {
        if (c.readyState === 1) c.send(e.data);
      });
    };

    server.onclose = () => clients.delete(server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
};