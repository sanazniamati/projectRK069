import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Stage, Layer, Rect, Transformer, Circle } from "react-konva";

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      //TODO: this
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          //TODO: scaleX & scaleY Unresolved function
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          borderStrokeWidth={5}
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            //TODO:dont work if there
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const initialRectangles = [
  {
    x: 100,
    y: 200,
    width: 100,
    height: 100,
    // radios: 70,
    fill: "red",
    id: "rect1",
  },
  {
    x: 250,
    y: 200,
    width: 100,
    height: 100,
    // radios: 70,
    fill: "green",
    id: "rect2",
  },
];

const App = () => {
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectShape, setSelectShape] = useState(null);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectShape(null);
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      // onTouchStart={checkDeselect}
    >
      <Layer>
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectShape}
              onSelect={() => {
                setSelectShape(rect.id);
              }}
              onChange={(newAttrs) => {
                //TODO rectangles.slice()
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
