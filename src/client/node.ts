import AssetNode from './nodeTypes/AssetNode';
import { NodeTypes } from './nodeTypes/nodeTypes';
import PointerNode from './nodeTypes/PointerNode';
import SensorNode from './nodeTypes/SensorNode';

export const nodeTypes = {
  [NodeTypes.SENSOR]: SensorNode,
  [NodeTypes.ASSET]: AssetNode,
  [NodeTypes.POINTER]: PointerNode,
};

export interface NodeData extends Record<string, unknown> {
  label: string;
  lorem: string;
  type: NodeTypes;
}
