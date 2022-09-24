import useCanvas from './hooks/useCanvas';

interface Props {
  width?: number;
  height?: number;
}

const App: React.FC<Props> = () => {
  const ref = useCanvas();
  return (
    <canvas
      ref={ref}
      id="canvas"
      width={window.innerWidth}
      height={window.innerHeight}
    >
      Canvas
    </canvas>
  );
};

App.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export default App;
