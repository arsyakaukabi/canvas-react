'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Canvas = dynamic(() => import('../components/canvas'), {
  ssr: false,
});

export default function Page() {
  const [text, setText] = useState('Diskon\n30%');
  const [fontSize, setFontSize] = useState(64);


  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleChangeFontSize = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setFontSize(value);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        id="text"
        name="text"
        value={text}
        onChange={handleChange}
        placeholder="Enter your text here"
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="fontSize">Font Size:</label>
        <input
          type="number"
          id="fontSize"
          name="fontSize"
          value={fontSize}
          onChange={handleChangeFontSize}
          min={1}
          style={{ width: 50, marginLeft: 5 }}
        />
        <span style={{ marginLeft: 5 }}>px</span>
      </div>
      <Canvas text={text} fontSize={fontSize} />
    </div>
  );
}