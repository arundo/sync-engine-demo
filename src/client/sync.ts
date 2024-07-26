import _pick from 'lodash/pick';
import { Edge, Node } from '@xyflow/react';
import socket from './socketio';

const syncNodeProp = (node: Node) => {
  return _pick(node, ['id', 'position', 'data', 'type']);
};

export const sync = (nodes?: Node[], edges?: Edge[]) => {
  fetch('/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'socket-id': socket.id,
    },
    body: JSON.stringify({ nodes: nodes && nodes.map(syncNodeProp), edges }),
  })
    .then((response) => response.json())
    .catch((error) => console.error('Error syncing', error));
};
