import { Menu, Bell, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/10 lg:justify-end">
      <div className="flex items-center lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-textSecondary rounded-lg hover:bg-white/5 hover:text-textPrimary"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 relative text-textSecondary rounded-full hover:bg-white/5 hover:text-textPrimary">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-textPrimary leading-none">{user?.name}</p>
            <p className="text-xs text-textSecondary mt-1 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/20 text-primary">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
