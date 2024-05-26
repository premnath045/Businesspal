import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from "@/components/ui/use-toast"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { signupValidation } from '@/lib/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Loader from '@/components/shared/Loader'
import { useCreateAccount, useSignInAccount } from '@/lib/react-query/queriesAndMutations'
import { useUserContext } from '@/context/AuthContext'


const SignupForm = () => {
  const { toast } = useToast()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  // calling createUserAccount through react query middleware
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateAccount();

  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  // Define form structure
  const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })
 
  // Define form submit handler.
  async function onSubmit(values: z.infer<typeof signupValidation>) {
    // creating new user on signup
    const newUser = await createUserAccount(values);
    
    if(!newUser) {
      toast({title: "Signup failed. Please try again."})
    } else{
      toast({title: "Signup successful."})
    }

    // asigns authenticated user into a session
     const session = await signInAccount({
      email: values.email,
      password: values.password,
    })

    if(!session) {
      toast({ title:"sign-in failed. please try again." })
    }

    const isLoggedIn = await checkAuthUser();
    if(isLoggedIn){
      form.reset();
      navigate('/')
    } else {
      toast({title: "sign up failed. please try again."})
    } 

  }

  return (
    <Form {...form}>
      <div className='sm:w-420 flex-center flex-col'>
        <img src="/assets/images/logo.svg" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">Signup to find your dream property</p>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="enter name" type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="enter username" type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="enter email" type='email' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="enter password" type='password' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
              {isCreatingAccount ? (
                <div className='flex-center gap-2'>
                  <Loader />
                  Loading...
                </div>
              ) : (
                <div className='flex-center gap-2'>Signup</div>
              )}
          </Button>

          <p className='text-small-regular text-light-2 text-center mt-2'>
            Already have an account?
            <Link to="/sign-in" className='text-primary-500 text-small-semibold ml-1'>Log in</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignupForm