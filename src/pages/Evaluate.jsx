import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Upload, PenTool, Eraser, Save, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiClient';
import './Evaluate.css';

const EvaluationCanvas = forwardRef(({ imageUrl }, ref) => {
  const [image] = useImage(imageUrl);
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen'); 
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  useImperativeHandle(ref, () => ({
    exportImage: async () => {
      if (!stageRef.current) return null;
      const dataUrl = stageRef.current.toDataURL();
      const res = await fetch(dataUrl);
      return await res.blob();
    }
  }));

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
      <div className="stage-wrapper glass-panel" style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
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
                stroke={line.tool === 'eraser' ? '#ffffff' : '#ef4444'}
                strokeWidth={line.tool === 'eraser' ? 20 : 4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
});

const Evaluate = () => {
  const { profile } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [revisions, setRevisions] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [newComment, setNewComment] = useState('');
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchRevisions(selectedProject.id);
      
      const sub = supabase
        .channel('public:project_revisions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_revisions', filter: `project_id=eq.${selectedProject.id}` }, (payload) => {
          setRevisions(current => [...current, payload.new]);
        })
        .subscribe();
      return () => supabase.removeChannel(sub);
    } else {
      setRevisions([]);
      setUploadedImage(null);
    }
  }, [selectedProject]);

  const fetchInitialData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/users?public=true'),
        api.get('/projects')
      ]);
      const users = usersRes.data || [];
      const map = {};
      users.forEach(p => map[p.id] = p);
      setProfilesMap(map);
      const projs = projectsRes.data || [];
      setProjects(projs);
      if (projs.length > 0) setSelectedProject(projs[0]);
    } catch (err) {
      console.error('Evaluate init error:', err);
    }
  };

  const fetchRevisions = async (projectId) => {
    try {
      const { data } = await api.get(`/revisions?projectId=${projectId}`);
      const revs = data || [];
      setRevisions(revs);
      const latestImage = [...revs].reverse().find(r => r.image_url);
      setUploadedImage(latestImage ? latestImage.image_url : null);
    } catch (err) {
      console.error('Fetch revisions error:', err);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedProject) return;
    try {
      await api.post('/revisions', {
        project_id: selectedProject.id,
        text_content: newComment.trim()
      });
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // Helper to convert File/Blob to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // get raw base64 string
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) return;
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const fileName = `revisions/${selectedProject.id}/${Date.now()}_${file.name}`;
      
      const { data: uploadRes } = await api.post('/upload', {
        fileName,
        contentType: file.type,
        base64
      });

      await api.post('/revisions', {
        project_id: selectedProject.id,
        text_content: 'Uploaded a new design revision.',
        image_url: uploadRes.publicUrl
      });
      setUploadedImage(uploadRes.publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setIsUploading(false);
  };

  const handleSaveAnnotations = async () => {
    if (!canvasRef.current || !selectedProject) return;
    setIsUploading(true);
    try {
      const blob = await canvasRef.current.exportImage();
      const base64 = await fileToBase64(blob);
      const fileName = `revisions/${selectedProject.id}/annotation_${Date.now()}.png`;

      const { data: uploadRes } = await api.post('/upload', {
        fileName,
        contentType: 'image/png',
        base64
      });

      await api.post('/revisions', {
        project_id: selectedProject.id,
        text_content: 'Saved annotated feedback.',
        image_url: uploadRes.publicUrl
      });
    } catch (err) {
      console.error('Failed to save annotations', err);
      alert('Failed to save annotation: ' + err.message);
    }
    setIsUploading(false);
  };

  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin' || profile?.role === 'Event Coordinator';

  return (
    <div className="evaluate-container animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">Evaluate & Revisions</h1>
          <p>Public revisions for transparency and feedback.</p>
        </div>
        <select 
          className="glass-input" 
          style={{ width: '300px' }}
          value={selectedProject?.id || ''}
          onChange={e => setSelectedProject(projects.find(p => p.id === e.target.value))}
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          {projects.length === 0 && <option value="">No projects available</option>}
        </select>
      </div>

      {!selectedProject ? (
        <div className="glass-card flex-center">Select a project to view revisions.</div>
      ) : (
        <div className="evaluate-grid grid-cols-2">
          
          {/* Left Column: Image & Canvas */}
          <div className="evaluation-area">
            <div className="upload-section glass-panel">
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              <label htmlFor="file-upload" className="upload-label" style={{ opacity: isUploading ? 0.5 : 1 }}>
                {isUploading ? <Loader2 className="spin" size={32} /> : <Upload size={32} />}
                <span>{isUploading ? 'Processing...' : 'Upload new design revision'}</span>
              </label>
            </div>

            {uploadedImage ? (
              <div className="annotation-section mt-2">
                <h3>Design Preview</h3>
                {uploadedImage.includes('drive.google.com') ? (
                  <div className="stage-wrapper glass-panel flex-center" style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <img src={uploadedImage} alt="Design Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <>
                    <EvaluationCanvas imageUrl={uploadedImage} ref={canvasRef} />
                    {isAdmin && (
                      <button className="btn btn-primary mt-2" style={{width: '100%'}} onClick={handleSaveAnnotations} disabled={isUploading}>
                        {isUploading ? <Loader2 className="spin" size={18} /> : <Save size={18} />} 
                        {isUploading ? 'Saving...' : 'Save Annotations'}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="glass-card mt-2 flex-center" style={{ height: '400px', color: 'var(--text-secondary)' }}>
                No images uploaded for this project yet.
              </div>
            )}
          </div>

          {/* Right Column: Comments & Revisions */}
          <div className="feedback-area glass-card">
            <div className="feedback-header">
              <h3><MessageSquare size={20} /> Revisions & Comments</h3>
            </div>
            
            <div className="comments-list">
              {revisions.map(rev => {
                const author = profilesMap[rev.user_id] || { name: 'Unknown', role: 'Member' };
                const isSystem = rev.text_content.includes('Saved annotated') || rev.text_content.includes('Uploaded a new');
                
                return (
                  <div key={rev.id} className={`comment-bubble ${author.role !== 'Member' ? 'admin' : 'member'}`} style={{ opacity: isSystem ? 0.8 : 1 }}>
                    <div className="comment-meta">
                      <span className="comment-author">{author.name} <span className="comment-role badge">{author.role}</span></span>
                      <span className="comment-time">{new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="comment-text" style={{ fontStyle: isSystem ? 'italic' : 'normal' }}>
                      {rev.text_content}
                    </p>
                  </div>
                );
              })}
              {revisions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No comments or revisions yet.</p>}
            </div>

            <div className="comment-input-area">
              <textarea 
                className="glass-input" 
                placeholder="Type your feedback here..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
              />
              <button className="btn btn-primary send-btn" onClick={handleSendComment} disabled={!newComment.trim()}>
                <Send size={18} /> Send
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Evaluate;
