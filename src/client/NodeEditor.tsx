import React from 'react';
import { NodeTypes } from './nodeTypes/nodeTypes';
import { Node } from '@xyflow/react';

interface Props {
  selectedNode?: Node;
  addNode: (type: string) => void;
  updateNode: (key: string, subKey: string, value: string) => void;
}

const NodeEditor: React.FC<Props> = ({ selectedNode, addNode: addNodeOfType, updateNode }) => {
  const addNode = (e: React.MouseEvent<HTMLButtonElement>) => addNodeOfType(e.currentTarget.name);
  return (
    <>
      <div className="updatenode__controls">
        <button onClick={addNode} name={NodeTypes.ASSET.toString()}>
          Add Asset
        </button>
        <button onClick={addNode} name={NodeTypes.SENSOR.toString()}>
          Add Sensor
        </button>
        <button onClick={addNode} name={NodeTypes.POINTER.toString()}>
          Add Pointer
        </button>
        {selectedNode && (
          <>
            <label>label:</label>
            <input
              value={(selectedNode?.data?.label as string) || ''}
              onChange={(evt) => {
                updateNode('data', 'label', evt.target.value);
              }}
            />

            <label>some value:</label>
            <input
              value={(selectedNode?.data?.lorem as string) || ''}
              onChange={(evt) => {
                updateNode('data', 'lorem', evt.target.value);
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default NodeEditor;
