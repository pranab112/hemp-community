import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Course, LearningProgress } from '../types';
import { BookOpen, CheckCircle, PlayCircle, Award, Lock, Download } from 'lucide-react';

export const Education: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'courses' | 'certificates'>('courses');

  const fetchData = async () => {
    const c = await db.getCourses();
    setCourses(c);
    if (user) {
        const p = await db.getLearningProgress(user.id);
        setProgress(p);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleStartModule = async (courseId: string) => {
    if (!user) return;
    const currentProgress = progress.find(p => p.course_id === courseId);
    const nextModule = (currentProgress?.completed_modules || 0) + 1;
    
    await db.updateCourseProgress(user.id, courseId, nextModule);
    fetchData(); 
  };
  
  const handleDownloadCert = () => {
      alert("Downloading Certificate...");
  };

  if (loading) return <div className="p-10 text-center">Loading courses...</div>;

  const completedCourses = progress.filter(p => p.is_completed).map(p => {
      return {
          ...p,
          course: courses.find(c => c.id === p.course_id)
      };
  }).filter(item => item.course);

  return (
    <div className="space-y-6">
       <div className="bg-indigo-900 rounded-xl p-8 text-white relative overflow-hidden">
         <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-2">Hemp Academy</h2>
            <p className="text-indigo-200 mb-4">Master the art of sustainable hemp cultivation and blockchain technology. Earn points and certificates.</p>
            <div className="flex gap-4 text-sm font-bold">
                <button onClick={() => setViewMode('courses')} className={`px-4 py-2 rounded-full flex items-center transition-colors ${viewMode === 'courses' ? 'bg-white text-indigo-900' : 'bg-white/10 hover:bg-white/20'}`}>
                    <BookOpen size={16} className="mr-2"/> Courses
                </button>
                <button onClick={() => setViewMode('certificates')} className={`px-4 py-2 rounded-full flex items-center transition-colors ${viewMode === 'certificates' ? 'bg-white text-indigo-900' : 'bg-white/10 hover:bg-white/20'}`}>
                    <Award size={16} className="mr-2"/> My Certificates
                </button>
            </div>
         </div>
         <BookOpen className="absolute -right-6 -bottom-6 text-white/5 w-64 h-64" />
       </div>

       {viewMode === 'courses' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                 const userProgress = progress.find(p => p.course_id === course.id);
                 const percent = userProgress ? Math.round((userProgress.completed_modules / course.modules_count) * 100) : 0;
                 const isCompleted = percent === 100;

                 return (
                     <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
                        <div className="h-32 bg-gray-200 relative">
                            <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {course.difficulty}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 flex-1">{course.description}</p>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>Progress</span>
                                    <span>{percent}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs font-bold text-indigo-600 flex items-center">
                                        <Award size={14} className="mr-1" /> +{course.points_reward} pts
                                    </span>
                                    {isCompleted ? (
                                        <button disabled className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center cursor-default">
                                            <CheckCircle size={16} className="mr-1" /> Completed
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleStartModule(course.id)}
                                            disabled={!user}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors disabled:opacity-50"
                                        >
                                            <PlayCircle size={16} className="mr-1" /> {userProgress ? 'Continue' : 'Start'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                     </div>
                 );
              })}
           </div>
       )}

       {viewMode === 'certificates' && (
           <div className="space-y-4">
               {completedCourses.length === 0 ? (
                   <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                       <p className="text-gray-500">You haven't completed any courses yet.</p>
                   </div>
               ) : (
                   completedCourses.map((item: any) => (
                       <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between shadow-sm">
                           <div className="flex items-center mb-4 sm:mb-0">
                               <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mr-4">
                                   <Award size={24} />
                               </div>
                               <div>
                                   <h3 className="font-bold text-gray-900">{item.course.title}</h3>
                                   <p className="text-sm text-gray-500">Completed on {new Date(item.last_updated).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <button onClick={handleDownloadCert} className="flex items-center text-sm font-bold text-gray-600 hover:text-indigo-600 border border-gray-300 hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors">
                               <Download size={16} className="mr-2" /> Download PDF
                           </button>
                       </div>
                   ))
               )}
           </div>
       )}
    </div>
  );
};
