import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecureDocumentsSection from "@/components/SecureDocumentsSection";

const Documents = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-8">
                {/* Page Header */}
                <section className="bg-gradient-section py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Documents & Resources
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Access important church documents, reports, and resources
                        </p>
                    </div>
                </section>

                {/* Documents Section */}
                <SecureDocumentsSection />
            </main>

            <Footer />
        </div>
    );
};

export default Documents;
