import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

function FabricJSCanvas() {

    return (
        <>
        <canvas width="300" height="300" ref={canvasEl}/>
        </>
    )
}
export default FabricJSCanvas;