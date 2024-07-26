import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Node, Edge, useStoreApi, useOnSelectionChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { v4 as uuidv4 } from 'uuid';
import { sync } from './sync';
import socket from './socketio';
import NodeEditor from './NodeEditor';
import { NodeData, nodeTypes } from './node';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const FlowApp = () => {
  // @ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>[]>([]);
  // @ts-ignore
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node>();

  const {} = useStoreApi();

  useEffect(() => {
    fetch('/data')
      .then((response) => response.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      })
      .catch((error) => console.error('Error fetching data', error));

    // Sync and merge nodes
    socket.on('syncUpdate', (data) => {
      if (data.edges) {
        setEdges((prevEdges: any[]) => {
          const updatedEdgesMap = new Map(data.edges.map((edge: Edge) => [edge.id, edge]));

          const mergedEdges = prevEdges.map((edge) =>
            updatedEdgesMap.has(edge.id) ? updatedEdgesMap.get(edge.id) : edge,
          );

          data.edges.forEach((edge: Edge) => {
            if (!mergedEdges.find((e: any) => e.id === edge.id)) {
              mergedEdges.push(edge);
            }
          });

          return mergedEdges;
        });
      }
      if (data.nodes) {
        setNodes((prevNodes: any[]) => {
          const updatedNodesMap = new Map(data.nodes.map((node: Node) => [node.id, node]));

          const mergedNodes = prevNodes.map((node) =>
            updatedNodesMap.has(node.id) ? updatedNodesMap.get(node.id) : node,
          );

          data.nodes.forEach((node: Node) => {
            if (!mergedNodes.find((n: any) => n.id === node.id)) {
              mergedNodes.push(node);
            }
          });

          return mergedNodes;
        });
      }
    });

    return () => {
      socket.off('syncUpdate');
    };
  }, []);

  const onChange = useCallback(({ nodes }) => {
    setSelectedNode(nodes[0]);
  }, []);

  useOnSelectionChange({
    onChange,
  });

  const handleNodePropertyChange = (propertyKey: string, subkey: string, newValue: string) => {
    if (selectedNode) {
      const id = selectedNode?.id;
      const nodeIndex = nodes.findIndex((n) => n.id === id);

      if (nodeIndex === -1) return;

      const updatedNode: Node = {
        ...nodes[nodeIndex],
        [propertyKey]: {
          ...nodes[nodeIndex][propertyKey],
          [subkey]: newValue,
        },
      };

      const updatedNodes = [...nodes.slice(0, nodeIndex), updatedNode, ...nodes.slice(nodeIndex + 1)];

      // Optimistic update
      setNodes(updatedNodes);
      setSelectedNode(updatedNode);
      sync([updatedNode]);
    }
  };

  const addNode = (nodeType: string) => {
    const newNodeId = uuidv4();
    const prevNodeId = nodes[nodes.length - 1]?.id;
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: 10 + (nodes.length + 1) * 2, y: (nodes.length + 1) * 50 },
      data: { label: nodeType.toLowerCase() },
    };
    let newEdge;

    // Optimistic update
    setNodes([...nodes, newNode]);
    if (prevNodeId) {
      newEdge = { id: uuidv4(), source: prevNodeId, target: newNodeId };
      setEdges([...edges, newEdge]);
    }

    sync([newNode], newEdge ? [newEdge] : undefined);
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onSelectionChange={handleNodeClick}
        defaultViewport={defaultViewport}
        minZoom={0.2}
        maxZoom={4}
        attributionPosition="bottom-left"
        nodeTypes={nodeTypes}
      >
        <NodeEditor selectedNode={selectedNode} addNode={addNode} updateNode={handleNodePropertyChange} />
      </ReactFlow>
    </>
  );
};

export default FlowApp;
