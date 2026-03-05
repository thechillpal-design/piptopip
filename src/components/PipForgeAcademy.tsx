import { BookOpen, Download, FileText, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const courses = [
    {
        title: 'Forex Foundations',
        tag: 'BEGINNER',
        price: 'FREE',
        materials: ['Video Modules', 'Market Terminology PDF', 'Basic Indicators Guide']
    },
    {
        title: 'Algorithmic Bootcamp',
        tag: 'INTERMEDIATE',
        price: '$45',
        materials: ['Video Modules', 'EA Architecture PDF', 'Risk Models Excel Template']
    },
    {
        title: 'Advanced Price Action',
        tag: 'ADVANCED',
        price: '$180',
        materials: ['Video Modules', 'Advanced Patterns PDF', 'Live Trading Sessions']
    }
];

export default function PipForgeAcademy() {
    return (
        <section id="education" className="py-24 px-6 bg-void/80 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[10px] font-black text-pippin uppercase tracking-[0.5em] mb-4">PipForge Academy</h2>
                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-md">
                        Learn to <span className="text-white/40 italic">Trade</span>
                    </h3>
                    <p className="text-sm font-medium text-white/80 max-w-xl mx-auto mt-4 drop-shadow-sm">
                        Master the markets at your own pace. Instantly download course curriculums, PDFs, exclusive indicators, and video material directly to your dashboard.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map((course, i) => (
                        <motion.div
                            key={course.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true, margin: "-10%" }}
                            className="glass-card p-8 flex flex-col group border-white/10 hover:border-pippin/30"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black text-pippin uppercase tracking-widest py-1 px-2 rounded bg-pippin/10 border border-pippin/20">
                                    {course.tag}
                                </span>
                                <BookOpen className="w-5 h-5 text-white/20 group-hover:text-pippin transition-colors" />
                            </div>

                            <h4 className="text-2xl text-white font-black uppercase tracking-tighter mb-2 drop-shadow-md">{course.title}</h4>
                            <div className="text-3xl font-black mb-8 text-white drop-shadow-lg">{course.price}</div>

                            <div className="flex-1 space-y-4 mb-8">
                                <h5 className="text-[10px] font-black text-white/70 uppercase tracking-widest border-b border-white/10 pb-2 mb-4 drop-shadow-sm">Included Material</h5>
                                {course.materials.map(mat => (
                                    <div key={mat} className="flex items-center gap-3 text-xs font-bold text-white/90">
                                        {mat.includes('PDF') ? <FileText className="w-3 h-3 text-pippin" /> : mat.includes('Video') ? <Video className="w-3 h-3 text-pippin" /> : <Download className="w-3 h-3 text-pippin" />}
                                        {mat}
                                    </div>
                                ))}
                            </div>

                            <Link to={`/checkout?plan=${encodeURIComponent(course.title)}&price=${encodeURIComponent(course.price)}&type=Course`} className="w-full py-4 bg-white/5 border border-white/20 text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-xl hover:bg-pippin hover:text-black hover:border-pippin transition-all flex items-center justify-center gap-2 group-hover:bg-white/10 active:scale-95">
                                <Download className="w-3 h-3" /> Purchase & Download
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
