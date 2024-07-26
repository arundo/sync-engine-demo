import * as React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowApp from './FlowApp';
import './index.css';

export default function App() {
  return (
    <>
      {/* <div>Hello world</div> */}
      <ReactFlowProvider>
        <FlowApp />
      </ReactFlowProvider>
    </>
  );
}
