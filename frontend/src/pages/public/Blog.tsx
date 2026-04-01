import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const posts = [
  { id: '1', title: 'How to Choose the Right Mentor for Your Career Goals', excerpt: 'Finding the perfect mentor is crucial. Here are 7 tips to help you make the right choice.', date: 'Mar 25, 2026', category: 'Tips', image: '' },
  { id: '2', title: '10 Skills That Will Be in Demand in 2027', excerpt: 'Stay ahead of the curve by learning these high-demand skills now.', date: 'Mar 20, 2026', category: 'Industry', image: '' },
  { id: '3', title: 'Success Story: How Priya Went from Beginner to Full-Stack Developer', excerpt: 'Read how a Windows Learning learner transformed her career in 6 months.', date: 'Mar 15, 2026', category: 'Stories', image: '' },
  { id: '4', title: 'The Benefits of 1-on-1 Mentorship vs Online Courses', excerpt: 'Why personalized guidance often beats pre-recorded content.', date: 'Mar 10, 2026', category: 'Education', image: '' },
  { id: '5', title: 'Mentor Spotlight: Dr. Sarah Chen on Teaching React', excerpt: 'Our top-rated mentor shares her approach to teaching web development.', date: 'Mar 5, 2026', category: 'Spotlight', image: '' },
  { id: '6', title: 'Windows Learning Launches Corporate Training Plans', excerpt: 'Enterprises can now upskill their teams with expert mentors.', date: 'Mar 1, 2026', category: 'News', image: '' },
];

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 blog-background">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground mb-8">Insights, tips, and stories from the Windows Learning community</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/20">WL</span>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <span className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline cursor-pointer">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
