// https://reactflow.dev/examples/nodes/custom-node
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export default memo(({ data }) => {
  return (
    <>
      <div>{data.label}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
