import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Group, Transformer, Rect } from 'react-konva';

const TextComponent = ({ textProps, isSelected, onSelect, onChange, draggable = true, borderSize }) => {

  const getTextWidth = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${textProps.fontSize}px ${textProps.fontFamily}`;
    return context.measureText(textProps.text).width;
  };

  const [width, setWidth] = useState(0.8 * borderSize.width);
  const [height, setHeight] = useState(textProps.fontSize);
  const textRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  console.log(width, height)


  useEffect(() => {
    if (isSelected && transformerRef.current !== null) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleResize = () => {
    if (textRef.current !== null) {
      const textNode = textRef.current;
      const newWidth = textNode.width() * textNode.scaleX();
      const newHeight = textNode.height() * textNode.scaleY();
      textNode.setAttrs({
        width: newWidth,
        scaleX: 1,
      });
      setWidth(newWidth);
      setHeight(newHeight);

    }
  };

  const dragBoundFunc = (pos) => {
    let x = pos.x;
    let y = pos.y;
    const stageWidth = borderSize.width;
    const stageHeight = borderSize.height;
    const objectWidth = width; // Mengambil skala untuk lebar objek
    const objectHeight = height; // Mengambil skala untuk tinggi objek

    // Batasi pergerakan objek agar tetap berada di dalam batas Stage
    if (x < 0) {
      x = 0;
    } else if (x > stageWidth - objectWidth) {
      x = stageWidth - objectWidth;
    }

    if (y < 0) {
      y = 0;
    } else if (y > stageHeight - objectHeight) {
      y = stageHeight - objectHeight;
    }
    return { x, y };
  };

  return (
    <React.Fragment>
      <Text
        ref={textRef}
        {...textProps}
        perfectDrawEnabled={false}
        onTransform={handleResize}
        onClick={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...textProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        width={width}
        dragBoundFunc={dragBoundFunc}
        draggable={draggable}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(50, newBox.width);
            return newBox;
          }}
          centeredScaling={true}
        />
      )}
    </React.Fragment>
  );
};


const GroupTextComponent = ({ promoTextPropsArray, isSelected, onSelect, borderSize }) => {

  const [maxWidth, setMaxWidth] = useState(borderSize.width * 0.8);
  const groupRef = useRef(null);
  const trRef = useRef(null);
  const textRef = useRef<any>(null);

  const groupX = promoTextPropsArray[0].x;
  const groupY = promoTextPropsArray[0].y;

  useEffect(() => {
    if (isSelected && trRef.current !== null) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // const calculateYCoordinate = (index) => {
  //   let y = 0;
  //   for (let i = 0; i < index; i++) {
  //     const textNode = new window.Konva.Text(promoTextPropsArray[i]);
  //     textNode.fontSize(promoTextPropsArray[i].fontSize);
  //     textNode.fontFamily(promoTextPropsArray[i].fontFamily);
  //     textNode.width(maxWidth)

  //     const rect = textNode.getClientRect();
  //     y += rect.height;
  //   }
  //   return y;
  // };

  const handleResize = () => {
    if (groupRef.current) {
      const group = groupRef.current;
      const rect = groupRef.current.getClientRect();
      group.getChildren().forEach((textNode) => {
        textNode.setAttrs({
          width: rect.width,
          scaleX: 1,
        });
      })
      setMaxWidth(rect.width); 
    }
  };

  return (
    <React.Fragment>
      <Group
        ref={groupRef}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        x={groupX}
        y={groupY}
        onTransform={handleResize}
      >
        {promoTextPropsArray.map((textProps, index) => {
          return (
            <Text
              key={textProps.id}
              {...textProps}
              x={0}
              y={index * 64}
              width={maxWidth}
            />
          );
        })}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(50, newBox.width);
            return newBox;
          }}
          centeredScaling={true}
          nodes={[groupRef.current]}
        />
      )}
    </React.Fragment>
  );
};

const Canvas = ({ text, fontSize }) => {
  const [selectedId, selectShape] = useState(null);
  const fontFamily = 'arial';
  const borderSize = {
    width: 500,
    height: 500
  }

  let promoTextPropsArray = [];
  if (text) {
    const arrayPromoText = text.split('\n');

    const logicPromoFontSize = (text, fontSize) => {
      if (text?.length <= 4) {
        return (8 / 10) * fontSize;
      } else if (text?.length <= 7) {
        return (6 / 10) * fontSize;
      } else if (text?.length <= 10) {
        return (5 / 10) * fontSize;
      } else {
        return (4 / 10) * fontSize;
      }
    };

    promoTextPropsArray = arrayPromoText.map((item, id) => {
      const height = logicPromoFontSize(item, fontSize ?? 14);
      return {
        id: `detail_promo_${id}`,
        type: 'text',
        fontSize: height,
        fontWeight: 700,
        align: 'center',
        text: item,
        x: borderSize.width * 0.1, // Adjust x position relative to the group's width
        y: borderSize.height * 0.1, // Adjust y position relative to the group's height
        // height: height,
        fontFamily: fontFamily,
        fill: 'white',
      };
    });
  }

  const handleSelectShape = (shapeId) => {
    if (selectedId === shapeId) {
      selectShape(null);
    } else {
      selectShape(shapeId);
    }
  };

  return (
    <Stage width={borderSize.width} height={borderSize.height} >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={borderSize.width}
          height={borderSize.height}
          fill="blue"
        />
        {promoTextPropsArray.length > 0 && (
          <GroupTextComponent
            promoTextPropsArray={promoTextPropsArray}
            onSelect={() => handleSelectShape('detail_promo_g')}
            isSelected={'detail_promo_g' === selectedId}
            borderSize={borderSize}
          />
        )}
        {/* <TextComponent
          textProps={promoTextPropsArray[0]}
          isSelected={'detail_promo' === selectedId}
          draggable={true}
          borderSize={borderSize}
          onSelect={() => handleSelectShape('detail_promo')}
          onChange={() => {
            ;
          }}
        /> */}
      </Layer>
    </Stage>
  );
};

export default Canvas;
