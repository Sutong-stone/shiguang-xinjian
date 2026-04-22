import { Link } from "react-router";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FFF8F0" }}
    >
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#FDECE4] flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-[#D4A78C]" />
        </div>
        <h1
          className="text-6xl font-light mb-4"
          style={{ color: "#8C7B72", fontFamily: '"Playfair Display", serif' }}
        >
          404
        </h1>
        <p className="text-[#8C7B72]/60 mb-8">
          这个页面似乎走失了，就像宝宝藏起来的小袜子
        </p>
        <Link to="/">
          <Button className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-8 shadow-soft">
            <Home className="w-4 h-4 mr-2" />
            回到首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
