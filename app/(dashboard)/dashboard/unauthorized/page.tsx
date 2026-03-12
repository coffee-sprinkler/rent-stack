export default function UnauthorizedPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-3'>
      <h1 className='text-2xl font-semibold text-white'>Access Denied</h1>
      <p className='text-sm text-zinc-400'>
        You don&apos;t have permission to view this page.
      </p>
      <a
        href='/dashboard'
        className='text-sm text-indigo-400 hover:text-indigo-300 transition'
      >
        Back to Dashboard
      </a>
    </div>
  );
}
