import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Map, Shield, ChevronRight, BarChart3, Users, Globe } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                            Technoligia
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                                The Future of <br className="hidden sm:block" />
                                <span className="text-blue-600 dark:text-blue-500">Logistics Management</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                                Connect shippers, fleet owners, and drivers in one unified platform.
                                Streamline operations, track shipments in real-time, and maximize efficiency.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="group bg-blue-600 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-1 flex items-center gap-2"
                                >
                                    Get Started
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose Technoligia?</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Our platform provides tailored solutions for every stakeholder in the logistics chain.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            {/* Shipper Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">For Shippers</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Create and manage shipments effortlessly. Track your cargo in real-time and ensure timely deliveries with our advanced monitoring tools.
                                </p>
                            </div>

                            {/* Fleet Manager Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">For Fleet Managers</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Monitor your entire fleet at a glance. Manage drivers, schedule maintenance, and analyze performance metrics to optimize operations.
                                </p>
                            </div>

                            {/* Driver Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">For Drivers</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Receive real-time job alerts, access route details, and update status on the go. Designed for safety and ease of use.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust/Security Section */}
                <section className="bg-white dark:bg-slate-900 py-20 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-blue-900 dark:bg-blue-950 rounded-3xl p-8 sm:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-800 dark:bg-blue-900 opacity-50 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-4">Secure & Reliable</h2>
                                    <p className="text-blue-100 max-w-lg text-lg">
                                        Your data is protected with enterprise-grade security.
                                        Experience 99.9% uptime and dedicated support.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Shield className="h-24 w-24 text-blue-400 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Truck className="h-6 w-6 text-slate-500" />
                            <span className="text-xl font-semibold text-slate-200">Technoligia</span>
                        </div>
                        <p className="text-sm">
                            © {new Date().getFullYear()} Technoligia. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
