<script context="module">
	import { dev } from '$app/env';
	
	export async function load({ session }) {
        if (dev) {
            return {
                status: 302,
                redirect: '/ride/00001'
            }
        }
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}
		return {};
	}
</script>