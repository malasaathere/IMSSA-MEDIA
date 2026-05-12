import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Upload, PenTool, Eraser, Save, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Evaluate.css';

const EvaluationCanvas = ({ imageUrl, onSave }) => {
  const [image] = useImage(imageUrl);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const stageRef = useRef(null);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => setLines([]);

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <button className={`btn-icon ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')} title="Pen">
          <PenTool size={20} />
        </button>
        <button className={`btn-icon ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Eraser">
          <Eraser size={20} />
        </button>
        <button className="btn-icon" onClick={clearCanvas} title="Clear">
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Clear</span>
        </button>
      </div>
      <div className="stage-wrapper glass-panel">
        <Stage
          width={600}
          height={400}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {image && <KonvaImage image={image} width={600} height={400} />}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'eraser' ? '#ffffff' : '#ef4444'} // Red for annotations
                strokeWidth={line.tool === 'eraser' ? 20 : 4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

const Evaluate = () => {
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState('https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80'); // Mock initial image
  const [comments, setComments] = useState([
    { id: 1, user: 'Sarah', role: 'member', text: 'Here is the first draft of the logo animation frame.', time: '2 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now(), user: user.name.split(' ')[0], role: user.role, text: newComment, time: 'Just now' }]);
    setNewComment('');
  };

  return (
    <div className="evaluate-container animate-fade-in">
      <div className="projects-header">
        <h1 className="gradient-text">Evaluate Submissions</h1>
        <p>Review designs, add annotations, and provide feedback.</p>
      </div>

      <div className="evaluate-grid grid-cols-2">
        
        {/* Left Column: Image & Canvas */}
        <div className="evaluation-area">
          {user?.role === 'member' && (
            <div className="upload-section glass-panel">
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
              <label htmlFor="file-upload" className="upload-label">
                <Upload size={32} />
                <span>Click to upload new design revision</span>
              </label>
            </div>
          )}

          {uploadedImage && (
            <div className="annotation-section">
              <h3>Design Preview</h3>
              <EvaluationCanvas imageUrl={uploadedImage} />
              {user?.role === 'admin' && (
                <button className="btn btn-primary mt-2" style={{width: '100%'}}>
                  <Save size={18} /> Save Annotations
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Comments & Revisions */}
        <div className="feedback-area glass-card">
          <div className="feedback-header">
            <h3><MessageSquare size={20} /> Revisions & Comments</h3>
          </div>
          
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className={`comment-bubble ${comment.role === 'admin' ? 'admin' : 'member'}`}>
                <div className="comment-meta">
                  <span className="comment-author">{comment.user} <span className="comment-role badge">{comment.role}</span></span>
                  <span className="comment-time">{comment.time}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>

          <div className="comment-input-area">
            <textarea 
              className="glass-input" 
              placeholder="Type your feedback here..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
            />
            <button className="btn btn-primary send-btn" onClick={handleSendComment}>
              <Send size={18} /> Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Evaluate;
