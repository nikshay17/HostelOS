import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageLayout = ({ children }) => (
  <div className="flex flex-col h-screen bg-muted">
    <Navbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

export default PageLayout;