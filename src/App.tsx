import {Routes, Route} from 'react-router-dom';
import './globals.css';
import { AllUsers, CreatePost, EditPost, Home, PostDetails, Profile, Saved, UpdateProfile, Audit } from './_root/pages';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import { Toaster } from "@/components/ui/toaster"
import { GeneratedContentProvider } from './_root/pages/GeneratedContentContext';
const App = () =>{
    return(
        <main className="flex h-screen">
            <GeneratedContentProvider>
                <Routes>
                    {/* Public routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/sign-in" element={<SigninForm />} />
                        <Route path="/sign-up" element={<SignupForm />} />
                    </Route>

                    {/* private routes */}
                    <Route element={<RootLayout />}>
                        <Route index element={<Home />} />
                        <Route path="/saved" element={<Saved />} />
                        <Route path="/all-users" element={<AllUsers />} />
                        <Route path="/create-post" element={<CreatePost />} />
                        <Route path="/update-post/:id" element={<EditPost />} />
                        <Route path="/posts/:id" element={<PostDetails />} />
                        <Route path="/profile/:id/*" element={<Profile />} />
                        <Route path="/update-profile/:id" element={<UpdateProfile />} />
                        <Route path="/audit" element={<Audit />} />
                    </Route>

                </Routes>
            </GeneratedContentProvider>    

            <Toaster />
        </main>
    )
}

export default App