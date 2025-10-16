import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import { TypeAnimation } from 'react-type-animation';



export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fdfcfb] via-[#f7f5ec] to-[#faf6e9] text-slate-900">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-grow px-6 pt-24 pb-16">
        {/* Hero Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-slate-800"
        >
          Simplify Client Management. <br />

          <TypeAnimation
                sequence={[
                  // Same substring at the start will only be typed out once, initially
                  'Build Stronger Relationships.',
                  1000, // wait 1s before replacing "Mice" with "Hamsters"
                  'Amplify Growth.',
                  1000,
                  'Track. Engage. Succeed.',
                  1000,
                  'Your All-in-One CRM Solution.',
                  1000
                ]}
                wrapper="span"
                speed={50}
                style={{ fontSize: '3rem', display: 'inline-block' }}
                repeat={Infinity}
                className="text-[var(--brand)]"
              />

{/*           <span className="">Amplify Growth.</span> */}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-slate-600 mb-10"
        >
          ClientSphere helps businesses nurture relationships, close deals, and grow revenue — 
          all in one powerful platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
        >
          <Link 
            to="/login" 
            className="px-8 py-3 text-lg font-semibold rounded-lg bg-white border border-gray-300 text-[var(--brand)] hover:bg-gray-50 transition-all shadow-sm"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-3 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
          >
            Sign Up Free
          </Link>
        </motion.div>

        {/* Trusted Section */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-sm text-gray-500 mt-4"
        >
          Trusted by <span className="font-semibold text-slate-700">2,500+</span> growing businesses worldwide.
        </motion.p>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-4"
          >
            <h3 className="text-4xl font-bold text-slate-800 mb-2">2,500+</h3>
            <p className="text-gray-500">Active Businesses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-4"
          >
            <h3 className="text-4xl font-bold text-slate-800 mb-2">98%</h3>
            <p className="text-gray-500">Customer Satisfaction</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-4"
          >
            <h3 className="text-4xl font-bold text-slate-800 mb-2">50K+</h3>
            <p className="text-gray-500">Deals Closed</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}




