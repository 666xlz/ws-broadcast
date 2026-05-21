const clients = new Set();

export default {
  async fetch(request) {
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response("Not found", { status: 404 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);
    clients.add(socket);

    socket.onmessage = (e) => {
      for (const client of clients) {
        if (client.readyState === 1) client.send(e.data);
      }
    };

    socket.onclose = () => {
      clients.delete(socket);
    };

    socket.onerror = () => {
      clients.delete(socket);
    };

    return response;
  }
};
