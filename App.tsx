import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import  {Article}  from './pages/Article';
import { Search } from './pages/Search';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Category } from './pages/Category';
import { Author } from './pages/Author';
import { Trending } from './pages/Trending';
import { Newsletter } from './pages/Newsletter';
import { Profile } from './pages/Profile';
import { Archive } from './pages/Archive';
import Categories from './pages/Categories';
// Coding Platform Pages
import Practice from './pages/Practice';
import Problem from './pages/Problem';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import Submissions from './pages/Submissions';
import Lesson from './pages/Lesson';

const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <Layout>
        <Routes>
          {/* Blog Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/author/:slug" element={<Author />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Coding Platform Routes */}
          <Route path="/practice" element={<Practice />} />
          <Route path="/problem/:slug" element={<Problem />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:slug" element={<Challenges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/lesson/:slug" element={<Lesson />} />
        </Routes>
      </Layout>
    </Router>
    </AuthProvider>
  );
};

export default App;