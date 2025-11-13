import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };

    const loadCategories = async () => {
      try {
        const cats = await base44.entities.Category.filter(
          { is_active: true },
          "sort_order",
          20
        );
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      }
    };

    loadUser();
    loadCategories();
  }, []);

  const noHeaderFooterPages = ["Login", "Register", "ForgotPassword"];
  const showHeaderFooter = !noHeaderFooterPages.includes(currentPageName);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeaderFooter && <Header user={user} categories={categories} />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showHeaderFooter && <Footer categories={categories} />}
    </div>
  );
}