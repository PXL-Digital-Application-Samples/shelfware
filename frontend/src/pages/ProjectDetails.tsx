import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, deleteProject } from '../services/projectService.ts';
import { Project } from '../interfaces/Project.ts';
import { formatDate, getStatusColor, formatHardwareInfo } from '../utils/formatters.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import './ProjectDetails.css';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Don't parse the ID as an integer, use it directly as a string
        const data = await getProjectById(id);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. The project may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      // Don't parse the ID as an integer, use it directly as a string
      await deleteProject(id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="project-details-error">
        <h2>Error</h2>
        <p>{error || 'Project not found'}</p>
        <Link to="/" className="back-link">Back to Projects</Link>
      </div>
    );
  }

  const statusStyle = {
    backgroundColor: getStatusColor(project.status)
  };

  return (
    <div className="project-details-container">
      <div className="details-header">
        <Link to="/" className="back-button">
          &larr; Back to Projects
        </Link>
        
        <div className="details-actions">
          <Link to={`/edit/${project.id}`} className="edit-button">
            Edit Project
          </Link>
          <button 
            onClick={handleDeleteClick}
            className="delete-button"
          >
            Delete Project
          </button>
        </div>
      </div>
      
      <div className="project-details-card">
        <div className="details-title-row">
          <h1>{project.title}</h1>
          <span className="details-status" style={statusStyle}>
            {project.status}
          </span>
        </div>
        
        {project.description && (
          <div className="details-section">
            <h2>Description</h2>
            <p>{project.description}</p>
          </div>
        )}
        
        <div className="details-section">
          <h2>Links</h2>
          {(!project.githubUrl && !project.deployedUrl && !project.docsUrl) ? (
            <p className="no-content">No links provided</p>
          ) : (
            <div className="details-links">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="details-link github-link"
                >
                  <span className="link-icon">&#128279;</span>
                  GitHub Repository
                </a>
              )}
              
              {project.deployedUrl && (
                <a 
                  href={project.deployedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="details-link demo-link"
                >
                  <span className="link-icon">&#128279;</span>
                  Live Demo
                </a>
              )}
              
              {project.docsUrl && (
                <a 
                  href={project.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="details-link docs-link"
                >
                  <span className="link-icon">&#128279;</span>
                  Documentation
                </a>
              )}
            </div>
          )}
        </div>
        
        {project.hardwareInfo && (
          <div className="details-section">
            <h2>Hardware Info</h2>
            <div className="hardware-info-box">
              <pre>{formatHardwareInfo(project.hardwareInfo)}</pre>
            </div>
          </div>
        )}
        
        <div className="details-metadata">
          {project.createdAt && (
            <p>Created: {formatDate(project.createdAt)}</p>
          )}
          {project.updatedAt && project.updatedAt !== project.createdAt && (
            <p>Last updated: {formatDate(project.updatedAt)}</p>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ProjectDetails;