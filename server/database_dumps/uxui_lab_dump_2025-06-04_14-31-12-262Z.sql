--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

-- Started on 2025-06-04 17:31:12 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS uxui_lab;
--
-- TOC entry 3809 (class 1262 OID 53069)
-- Name: uxui_lab; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE uxui_lab WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';


ALTER DATABASE uxui_lab OWNER TO postgres;

\connect uxui_lab

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 225 (class 1255 OID 53192)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 53126)
-- Name: analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analyses (
    id integer NOT NULL,
    project_id integer,
    analysis_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    results jsonb DEFAULT '{}'::jsonb,
    score integer,
    issues_found integer DEFAULT 0,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT analyses_score_check CHECK (((score >= 0) AND (score <= 100))),
    CONSTRAINT analyses_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.analyses OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 53125)
-- Name: analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analyses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analyses_id_seq OWNER TO postgres;

--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 215
-- Name: analyses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analyses_id_seq OWNED BY public.analyses.id;


--
-- TOC entry 222 (class 1259 OID 53240)
-- Name: assets; Type: TABLE; Schema: public; Owner: shadownight
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    project_id integer NOT NULL,
    filename character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size bigint DEFAULT 0 NOT NULL,
    mime_type character varying(100),
    asset_type character varying(50) DEFAULT 'other'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assets OWNER TO shadownight;

--
-- TOC entry 221 (class 1259 OID 53239)
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: shadownight
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.assets_id_seq OWNER TO shadownight;

--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 221
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shadownight
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 224 (class 1259 OID 53261)
-- Name: notifications; Type: TABLE; Schema: public; Owner: shadownight
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO shadownight;

--
-- TOC entry 223 (class 1259 OID 53260)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: shadownight
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO shadownight;

--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 223
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shadownight
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 214 (class 1259 OID 53111)
-- Name: project_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_files (
    id integer NOT NULL,
    project_id integer,
    original_name character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_files OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 53110)
-- Name: project_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_files_id_seq OWNER TO postgres;

--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 213
-- Name: project_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_files_id_seq OWNED BY public.project_files.id;


--
-- TOC entry 212 (class 1259 OID 53091)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    description text,
    project_type character varying(20) NOT NULL,
    website_url text,
    figma_url text,
    status character varying(20) DEFAULT 'active'::character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_project_type_check CHECK (((project_type)::text = ANY ((ARRAY['website'::character varying, 'figma'::character varying, 'screenshot'::character varying, 'mobile'::character varying, 'app'::character varying])::text[]))),
    CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'archived'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 53090)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO postgres;

--
-- TOC entry 3814 (class 0 OID 0)
-- Dependencies: 211
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 218 (class 1259 OID 53147)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    project_id integer,
    analysis_id integer,
    report_type character varying(20) DEFAULT 'pdf'::character varying,
    filename character varying(255),
    file_path text,
    file_size integer,
    status character varying(20) DEFAULT 'generating'::character varying,
    expires_at timestamp with time zone,
    download_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reports_report_type_check CHECK (((report_type)::text = ANY ((ARRAY['pdf'::character varying, 'html'::character varying, 'json'::character varying])::text[]))),
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY ((ARRAY['generating'::character varying, 'ready'::character varying, 'expired'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 53146)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 217
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 220 (class 1259 OID 53172)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer,
    token_hash character varying(255) NOT NULL,
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 53171)
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_sessions_id_seq OWNER TO postgres;

--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- TOC entry 210 (class 1259 OID 53071)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(100),
    role character varying(20) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'analyst'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 53070)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3581 (class 2604 OID 53129)
-- Name: analyses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses ALTER COLUMN id SET DEFAULT nextval('public.analyses_id_seq'::regclass);


--
-- TOC entry 3599 (class 2604 OID 53243)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 3605 (class 2604 OID 53264)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 53114)
-- Name: project_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_files ALTER COLUMN id SET DEFAULT nextval('public.project_files_id_seq'::regclass);


--
-- TOC entry 3572 (class 2604 OID 53094)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 3589 (class 2604 OID 53150)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 3596 (class 2604 OID 53175)
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- TOC entry 3564 (class 2604 OID 53074)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3795 (class 0 OID 53126)
-- Dependencies: 216
-- Data for Name: analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analyses (id, project_id, analysis_type, status, results, score, issues_found, started_at, completed_at, error_message, created_at) FROM stdin;
30	36	complete	completed	{"wcagLevel": "AA", "totalIssues": 5, "scannedPages": 15, "failedCriteria": 5, "passedCriteria": 35, "processingTime": 120}	85	5	2025-05-09 12:13:26.181973+03	2025-05-09 12:13:26.181973+03	\N	2025-05-09 12:13:26.181973+03
31	36	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 2, "scannedPages": 8, "failedCriteria": 2, "passedCriteria": 38, "processingTime": 90}	92	2	2025-05-14 12:13:26.183041+03	2025-05-14 12:13:26.183041+03	\N	2025-05-14 12:13:26.183041+03
32	36	performance	completed	{"loadTime": 2300, "totalIssues": 8, "scannedPages": 12, "processingTime": 180, "firstContentfulPaint": 800, "largestContentfulPaint": 2100}	78	8	2025-05-16 12:13:26.183472+03	2025-05-16 12:13:26.183472+03	\N	2025-05-16 12:13:26.183472+03
33	37	design	completed	{"layoutScore": 88, "totalIssues": 3, "contentScore": 90, "scannedPages": 6, "processingTime": 60, "navigationScore": 85}	88	3	2025-05-22 12:13:26.183858+03	2025-05-22 12:13:26.183858+03	\N	2025-05-22 12:13:26.183858+03
34	37	usability	running	\N	\N	0	2025-06-01 12:13:26.184234+03	\N	\N	2025-06-01 12:13:26.184234+03
35	41	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:13:26.184627+03
36	42	performance	completed	{"loadTime": 1800, "totalIssues": 6, "scannedPages": 10, "processingTime": 150, "firstContentfulPaint": 600, "largestContentfulPaint": 1500}	82	6	2025-05-31 12:13:26.184901+03	2025-05-31 12:13:26.184901+03	\N	2025-05-31 12:13:26.184901+03
37	44	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:11.210532+03	2025-05-09 12:16:11.210532+03	\N	2025-05-09 12:16:11.210532+03
38	44	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
39	44	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
40	45	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
41	45	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
42	45	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
43	46	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:11.210532+03
44	46	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
45	47	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
46	47	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
47	49	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:11.210532+03	2025-05-09 12:16:11.210532+03	\N	2025-05-09 12:16:11.210532+03
48	49	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
49	49	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
50	50	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
51	50	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
52	50	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
53	51	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:11.210532+03
54	51	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
55	52	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
56	52	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
57	54	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:11.210532+03	2025-05-09 12:16:11.210532+03	\N	2025-05-09 12:16:11.210532+03
58	54	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
59	54	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
60	55	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
61	55	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
62	55	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
63	56	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:11.210532+03
64	56	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
65	57	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
66	57	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
67	59	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:11.210532+03	2025-05-09 12:16:11.210532+03	\N	2025-05-09 12:16:11.210532+03
68	59	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
69	59	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
70	60	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
71	60	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
72	60	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
73	61	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:11.210532+03
74	61	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
75	62	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
76	62	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
78	64	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
79	64	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
80	65	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
81	65	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
82	65	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
84	66	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
85	67	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
86	67	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
97	74	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:11.210532+03	2025-05-09 12:16:11.210532+03	\N	2025-05-09 12:16:11.210532+03
98	74	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:11.210532+03	2025-05-12 12:16:11.210532+03	\N	2025-05-12 12:16:11.210532+03
99	74	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:11.210532+03	2025-05-14 12:16:11.210532+03	\N	2025-05-14 12:16:11.210532+03
100	75	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:11.210532+03	2025-05-16 12:16:11.210532+03	\N	2025-05-16 12:16:11.210532+03
101	75	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:11.210532+03	2025-05-19 12:16:11.210532+03	\N	2025-05-19 12:16:11.210532+03
102	75	accessibility	running	\N	\N	0	2025-06-01 12:16:11.210532+03	\N	\N	2025-06-01 12:16:11.210532+03
103	39	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:11.210532+03
104	39	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:11.210532+03	2025-05-22 12:16:11.210532+03	\N	2025-05-22 12:16:11.210532+03
105	77	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:11.210532+03	2025-05-26 12:16:11.210532+03	\N	2025-05-26 12:16:11.210532+03
106	77	accessibility	failed	\N	\N	0	2025-05-28 12:16:11.210532+03	2025-05-28 12:16:11.210532+03	\N	2025-05-28 12:16:11.210532+03
107	44	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
108	44	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
109	44	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
110	45	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
111	45	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
112	45	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
113	46	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:40.354648+03
114	46	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:40.354648+03	2025-05-22 12:16:40.354648+03	\N	2025-05-22 12:16:40.354648+03
115	47	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
116	47	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
117	49	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
118	49	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
119	49	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
120	50	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
121	50	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
122	50	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
123	51	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:40.354648+03
124	51	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:40.354648+03	2025-05-22 12:16:40.354648+03	\N	2025-05-22 12:16:40.354648+03
125	52	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
126	52	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
127	54	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
128	54	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
129	54	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
130	55	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
131	55	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
132	55	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
133	56	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:40.354648+03
134	56	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:40.354648+03	2025-05-22 12:16:40.354648+03	\N	2025-05-22 12:16:40.354648+03
135	57	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
136	57	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
137	59	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
138	59	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
139	59	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
140	60	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
141	60	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
142	60	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
143	61	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:40.354648+03
144	61	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:40.354648+03	2025-05-22 12:16:40.354648+03	\N	2025-05-22 12:16:40.354648+03
145	62	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
146	62	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
147	64	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
148	64	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
149	64	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
150	65	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
151	65	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
152	65	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
155	67	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
156	67	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
167	74	complete	completed	{"wcagLevel": "AA", "layoutScore": 88, "totalIssues": 12, "contentScore": 90, "scannedPages": 25, "failedCriteria": 12, "passedCriteria": 42, "processingTime": 180, "navigationScore": 85}	87	12	2025-05-09 12:16:40.354648+03	2025-05-09 12:16:40.354648+03	\N	2025-05-09 12:16:40.354648+03
168	74	accessibility	completed	{"wcagLevel": "AA", "totalIssues": 3, "scannedPages": 15, "failedCriteria": 3, "passedCriteria": 47, "processingTime": 120}	94	3	2025-05-12 12:16:40.354648+03	2025-05-12 12:16:40.354648+03	\N	2025-05-12 12:16:40.354648+03
169	74	performance	completed	{"loadTime": 2100, "totalIssues": 8, "scannedPages": 20, "processingTime": 200, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}	82	8	2025-05-14 12:16:40.354648+03	2025-05-14 12:16:40.354648+03	\N	2025-05-14 12:16:40.354648+03
170	75	design	completed	{"layoutScore": 93, "totalIssues": 4, "contentScore": 89, "scannedPages": 12, "processingTime": 90, "navigationScore": 92}	91	4	2025-05-16 12:16:40.354648+03	2025-05-16 12:16:40.354648+03	\N	2025-05-16 12:16:40.354648+03
171	75	usability	completed	{"layoutScore": 89, "totalIssues": 6, "contentScore": 91, "scannedPages": 10, "processingTime": 110, "navigationScore": 87}	89	6	2025-05-19 12:16:40.354648+03	2025-05-19 12:16:40.354648+03	\N	2025-05-19 12:16:40.354648+03
172	75	accessibility	running	\N	\N	0	2025-06-01 12:16:40.354648+03	\N	\N	2025-06-01 12:16:40.354648+03
173	39	complete	pending	\N	\N	0	\N	\N	\N	2025-06-02 12:16:40.354648+03
174	39	performance	completed	{"loadTime": 1800, "totalIssues": 7, "scannedPages": 18, "processingTime": 160, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}	85	7	2025-05-22 12:16:40.354648+03	2025-05-22 12:16:40.354648+03	\N	2025-05-22 12:16:40.354648+03
175	77	usability	completed	{"layoutScore": 93, "totalIssues": 3, "contentScore": 89, "scannedPages": 8, "processingTime": 70, "navigationScore": 94}	92	3	2025-05-26 12:16:40.354648+03	2025-05-26 12:16:40.354648+03	\N	2025-05-26 12:16:40.354648+03
176	77	accessibility	failed	\N	\N	0	2025-05-28 12:16:40.354648+03	2025-05-28 12:16:40.354648+03	\N	2025-05-28 12:16:40.354648+03
187	68	complete	completed	"{\\"scannedPages\\":33,\\"totalIssues\\":17,\\"processingTime\\":43}"	75	0	2025-06-03 12:35:45.365945+03	2025-06-03 12:35:51.377093+03	\N	2025-06-03 12:35:45.365945+03
188	68	complete	completed	"{\\"scannedPages\\":30,\\"totalIssues\\":17,\\"processingTime\\":227}"	91	0	2025-06-03 12:41:59.142918+03	2025-06-03 12:42:05.149781+03	\N	2025-06-03 12:41:59.142918+03
190	67	complete	completed	"{\\"scannedPages\\":21,\\"totalIssues\\":20,\\"processingTime\\":42}"	96	0	2025-06-03 13:05:51.437721+03	2025-06-03 13:05:57.445168+03	\N	2025-06-03 13:05:51.437721+03
191	120	performance	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	93	1	2025-06-04 08:29:49.946684+03	2025-06-04 07:29:49.946684+03	\N	2025-06-04 08:29:49.946684+03
192	121	performance	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	93	14	2025-06-04 08:29:49.955241+03	2025-06-04 07:29:49.955241+03	\N	2025-06-04 08:29:49.955241+03
193	123	usability	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	63	15	2025-06-04 08:30:09.005197+03	2025-06-04 07:30:09.005197+03	\N	2025-06-04 08:30:09.005197+03
194	124	performance	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	79	2	2025-06-04 08:30:09.010945+03	2025-06-04 07:30:09.010945+03	\N	2025-06-04 08:30:09.010945+03
195	126	accessibility	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	94	14	2025-06-04 08:30:22.509252+03	2025-06-04 07:30:22.509252+03	\N	2025-06-04 08:30:22.509252+03
196	127	accessibility	completed	{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}	82	16	2025-06-04 08:30:22.515763+03	2025-06-04 07:30:22.515763+03	\N	2025-06-04 08:30:22.515763+03
\.


--
-- TOC entry 3801 (class 0 OID 53240)
-- Dependencies: 222
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: shadownight
--

COPY public.assets (id, project_id, filename, original_name, file_path, file_size, mime_type, asset_type, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3803 (class 0 OID 53261)
-- Dependencies: 224
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: shadownight
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, created_at, updated_at) FROM stdin;
3	1	analysis_completed	Анализ завершен	Анализ проекта "Тестовый сайт" завершен с оценкой 85/100	{"score": 85, "project_id": 1, "analysis_id": 1}	f	2025-06-03 13:27:20.321021	2025-06-03 13:27:20.321021
4	1	analysis_completed	Анализ завершён	Анализ доступности для проекта "E-commerce Dashboard" успешно завершён.	"{\\"project_id\\":1,\\"analysis_id\\":1,\\"score\\":85}"	f	2025-06-04 08:30:23.038763	2025-06-04 08:30:23.038763
5	1	report_ready	Отчёт готов	Отчёт по проекту "Mobile Banking App" готов к скачиванию.	"{\\"project_id\\":2,\\"report_id\\":1}"	t	2025-06-04 08:30:23.041924	2025-06-04 08:30:23.041924
6	1	system_update	Обновление системы	Добавлены новые возможности анализа цветовых схем и типографики.	"{\\"version\\":\\"1.2.0\\"}"	f	2025-06-04 08:30:23.043238	2025-06-04 08:30:23.043238
2	1	project_created	Новый проект создан	Проект "Тестовый сайт" успешно создан и готов к анализу	{"project_id": 1, "project_name": "Тестовый сайт"}	t	2025-06-03 13:27:20.321021	2025-06-04 08:32:57.761645
\.


--
-- TOC entry 3793 (class 0 OID 53111)
-- Dependencies: 214
-- Data for Name: project_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_files (id, project_id, original_name, filename, file_path, file_size, mime_type, created_at) FROM stdin;
\.


--
-- TOC entry 3791 (class 0 OID 53091)
-- Dependencies: 212
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, user_id, name, description, project_type, website_url, figma_url, status, settings, created_at, updated_at) FROM stdin;
36	1	Интернет-магазин Техники	Анализ UX/UI интернет-магазина электроники с фокусом на удобство покупок	website	https://example-shop.com	\N	active	{}	2025-05-04 12:13:26.180152+03	2025-06-03 12:13:26.180152+03
37	1	Мобильное приложение Банка	Дизайн-система и пользовательский интерфейс банковского приложения	figma	\N	https://figma.com/file/banking-app	active	{}	2025-05-19 12:13:26.180152+03	2025-06-03 12:13:26.180152+03
38	1	Корпоративный сайт	Редизайн корпоративного сайта с улучшенной навигацией	website	https://corporate-site.com	\N	active	{}	2025-05-27 12:13:26.180152+03	2025-06-03 12:13:26.180152+03
39	1	Образовательная платформа	UX/UI дизайн онлайн-платформы для обучения студентов	website	https://eduplatform.com	\N	active	{}	2025-05-29 12:13:26.180152+03	2025-06-03 12:13:26.180152+03
40	1	Медицинское приложение	Мобильное приложение для записи к врачу и консультаций	figma	\N	https://figma.com/file/medical-app	active	{}	2025-05-31 12:13:26.180152+03	2025-06-03 12:13:26.180152+03
41	2	Новостной портал	Редизайн новостного сайта с улучшенной читаемостью	website	https://news-portal.com	\N	active	{}	2025-06-01 12:13:26.181451+03	2025-06-03 12:13:26.181451+03
42	2	Стартап Landing Page	Посадочная страница для стартапа в сфере технологий	website	https://startup-landing.com	\N	active	{}	2025-06-02 12:13:26.181451+03	2025-06-03 12:13:26.181451+03
43	2	Приложение для фитнеса	Дизайн мобильного приложения для тренировок и питания	figma	\N	https://figma.com/file/fitness-app	active	{}	2025-06-03 12:13:26.181451+03	2025-06-03 12:13:26.181451+03
44	2	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
45	2	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
46	2	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
47	2	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
48	2	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
49	3	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
50	3	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
51	3	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
52	3	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
53	3	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
54	4	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
55	4	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
56	4	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
57	4	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
58	4	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
59	5	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
60	5	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
61	5	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
62	5	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
63	5	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
64	6	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
66	6	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
67	6	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
74	1	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
75	1	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
76	1	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
77	1	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
78	1	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:11.210532+03	2025-06-03 12:16:11.210532+03
79	2	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
80	2	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
81	2	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
82	2	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
83	2	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
84	3	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
85	3	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
86	3	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
87	3	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
88	3	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
89	4	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
90	4	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
91	4	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
92	4	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
68	6	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	"{}"	2025-05-29 12:16:11.210532+03	2025-06-03 13:13:10.305644+03
93	4	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
94	5	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
95	5	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
96	5	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
97	5	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
98	5	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
99	6	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
100	6	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
101	6	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
102	6	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
109	1	E-commerce Интернет-магазин	Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок	website	https://demo-ecommerce.uxuilab.com	\N	active	{}	2025-05-04 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
110	1	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	{}	2025-05-14 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
111	1	Образовательная платформа	UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов	website	https://demo-education.uxuilab.com	\N	active	{}	2025-05-19 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
112	1	SaaS Dashboard	Интерфейс аналитической панели для B2B продукта	website	https://demo-saas.uxuilab.com	\N	active	{}	2025-05-24 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
113	1	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	figma	\N	https://figma.com/file/medical-telemedicine	active	{}	2025-05-29 12:16:40.354648+03	2025-06-03 12:16:40.354648+03
103	6	Медицинское приложение	Мобильное приложение для телемедицины и записи к врачам	screenshot	\N	https://figma.com/file/medical-telemedicine	active	"{}"	2025-05-29 12:16:40.354648+03	2025-06-03 12:59:38.588815+03
65	6	Мобильный Банкинг	Дизайн-система и интерфейсы мобильного банковского приложения	figma	\N	https://figma.com/file/banking-mobile-demo	active	"{}"	2025-05-14 12:16:11.210532+03	2025-06-03 13:07:51.225392+03
119	6	Мужские кроссовки	ddd	website	\N	\N	deleted	"{}"	2025-06-03 13:13:18.647868+03	2025-06-03 13:16:37.747736+03
120	1	E-commerce Dashboard	Анализ интерфейса административной панели для интернет-магазина	website	https://example-shop.com/admin	\N	active	{}	2025-06-04 08:29:49.941835+03	2025-06-04 08:29:49.941835+03
121	1	Mobile Banking App	UX анализ мобильного приложения банка	figma	\N	https://figma.com/file/xyz	active	{}	2025-06-04 08:29:49.95394+03	2025-06-04 08:29:49.95394+03
123	1	E-commerce Dashboard	Анализ интерфейса административной панели для интернет-магазина	website	https://example-shop.com/admin	\N	active	{}	2025-06-04 08:30:09.002617+03	2025-06-04 08:30:09.002617+03
124	1	Mobile Banking App	UX анализ мобильного приложения банка	figma	\N	https://figma.com/file/xyz	active	{}	2025-06-04 08:30:09.009423+03	2025-06-04 08:30:09.009423+03
126	1	E-commerce Dashboard	Анализ интерфейса административной панели для интернет-магазина	website	https://example-shop.com/admin	\N	active	{}	2025-06-04 08:30:22.507147+03	2025-06-04 08:30:22.507147+03
127	1	Mobile Banking App	UX анализ мобильного приложения банка	figma	\N	https://figma.com/file/xyz	active	{}	2025-06-04 08:30:22.514632+03	2025-06-04 08:30:22.514632+03
\.


--
-- TOC entry 3797 (class 0 OID 53147)
-- Dependencies: 218
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, project_id, analysis_id, report_type, filename, file_path, file_size, status, expires_at, download_count, created_at) FROM stdin;
22	36	30	pdf	full_analysis_report.pdf	/reports/full_analysis_36.pdf	2048576	ready	\N	12	2025-05-09 12:13:26.185136+03
23	36	31	pdf	accessibility_report.pdf	/reports/accessibility_36.pdf	1024768	ready	\N	8	2025-05-14 12:13:26.185731+03
24	37	33	pdf	design_audit_report.pdf	/reports/design_37.pdf	1536000	ready	\N	5	2025-05-22 12:13:26.186151+03
25	44	37	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_44_37.pdf	2850000	ready	\N	15	2025-05-09 12:16:11.210532+03
26	44	38	pdf	accessibility_detailed_report.pdf	/reports/accessibility_44_38.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
27	45	40	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_45_40.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
28	47	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_47.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
29	49	47	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_49_47.pdf	2850000	ready	\N	15	2025-05-09 12:16:11.210532+03
30	49	48	pdf	accessibility_detailed_report.pdf	/reports/accessibility_49_48.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
31	50	50	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_50_50.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
32	52	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_52.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
33	54	57	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_54_57.pdf	2850000	ready	\N	15	2025-05-09 12:16:11.210532+03
34	54	58	pdf	accessibility_detailed_report.pdf	/reports/accessibility_54_58.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
35	55	60	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_55_60.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
36	57	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_57.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
37	59	67	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_59_67.pdf	2850000	ready	\N	15	2025-05-09 12:16:11.210532+03
38	59	68	pdf	accessibility_detailed_report.pdf	/reports/accessibility_59_68.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
39	60	70	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_60_70.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
40	62	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_62.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
42	64	78	pdf	accessibility_detailed_report.pdf	/reports/accessibility_64_78.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
43	65	80	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_65_80.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
44	67	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_67.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
49	74	97	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_74_97.pdf	2850000	ready	\N	15	2025-05-09 12:16:11.210532+03
50	74	98	pdf	accessibility_detailed_report.pdf	/reports/accessibility_74_98.pdf	1450000	ready	\N	8	2025-05-12 12:16:11.210532+03
51	75	100	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_75_100.pdf	2100000	ready	\N	12	2025-05-16 12:16:11.210532+03
52	77	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_77.pdf	950000	generating	\N	0	2025-06-02 12:16:11.210532+03
53	44	37	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_44_37.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
54	79	37	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_79_37.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
55	44	38	pdf	accessibility_detailed_report.pdf	/reports/accessibility_44_38.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
56	79	38	pdf	accessibility_detailed_report.pdf	/reports/accessibility_79_38.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
57	45	40	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_45_40.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
58	80	40	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_80_40.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
59	47	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_47.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
60	82	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_82.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
61	49	47	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_49_47.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
62	84	47	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_84_47.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
63	49	48	pdf	accessibility_detailed_report.pdf	/reports/accessibility_49_48.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
64	84	48	pdf	accessibility_detailed_report.pdf	/reports/accessibility_84_48.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
65	50	50	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_50_50.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
66	85	50	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_85_50.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
67	52	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_52.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
68	87	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_87.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
69	54	57	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_54_57.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
70	89	57	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_89_57.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
71	54	58	pdf	accessibility_detailed_report.pdf	/reports/accessibility_54_58.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
72	89	58	pdf	accessibility_detailed_report.pdf	/reports/accessibility_89_58.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
73	55	60	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_55_60.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
74	90	60	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_90_60.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
75	57	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_57.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
76	92	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_92.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
77	59	67	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_59_67.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
78	94	67	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_94_67.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
79	59	68	pdf	accessibility_detailed_report.pdf	/reports/accessibility_59_68.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
80	94	68	pdf	accessibility_detailed_report.pdf	/reports/accessibility_94_68.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
81	60	70	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_60_70.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
82	95	70	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_95_70.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
83	62	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_62.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
84	97	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_97.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
87	64	78	pdf	accessibility_detailed_report.pdf	/reports/accessibility_64_78.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
88	99	78	pdf	accessibility_detailed_report.pdf	/reports/accessibility_99_78.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
89	65	80	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_65_80.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
90	100	80	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_100_80.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
91	67	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_67.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
92	102	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_102.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
101	74	97	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_74_97.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
102	109	97	pdf	ecommerce_full_analysis.pdf	/reports/ecommerce_full_109_97.pdf	2850000	ready	\N	15	2025-05-09 12:16:40.354648+03
103	74	98	pdf	accessibility_detailed_report.pdf	/reports/accessibility_74_98.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
104	109	98	pdf	accessibility_detailed_report.pdf	/reports/accessibility_109_98.pdf	1450000	ready	\N	8	2025-05-12 12:16:40.354648+03
105	75	100	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_75_100.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
106	110	100	pdf	mobile_banking_design_audit.pdf	/reports/design_audit_110_100.pdf	2100000	ready	\N	12	2025-05-16 12:16:40.354648+03
107	77	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_77.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
108	112	\N	pdf	monthly_summary_report.pdf	/reports/monthly_summary_112.pdf	950000	generating	\N	0	2025-06-02 12:16:40.354648+03
113	120	191	pdf	report_120_1749014989951.pdf	/reports/report_120_1749014989951.pdf	\N	ready	2025-07-04 08:29:49.951142+03	0	2025-06-04 08:29:49.951142+03
114	121	192	pdf	report_121_1749014989956.pdf	/reports/report_121_1749014989956.pdf	\N	ready	2025-07-04 08:29:49.956783+03	0	2025-06-04 08:29:49.956783+03
115	123	193	pdf	report_123_1749015009006.pdf	/reports/report_123_1749015009006.pdf	\N	ready	2025-07-04 08:30:09.007061+03	0	2025-06-04 08:30:09.007061+03
116	124	194	pdf	report_124_1749015009012.pdf	/reports/report_124_1749015009012.pdf	\N	ready	2025-07-04 08:30:09.012129+03	0	2025-06-04 08:30:09.012129+03
117	126	195	pdf	report_126_1749015022511.pdf	/reports/report_126_1749015022511.pdf	\N	ready	2025-07-04 08:30:22.511945+03	0	2025-06-04 08:30:22.511945+03
118	127	196	pdf	report_127_1749015022516.pdf	/reports/report_127_1749015022516.pdf	\N	ready	2025-07-04 08:30:22.516644+03	0	2025-06-04 08:30:22.516644+03
\.


--
-- TOC entry 3799 (class 0 OID 53172)
-- Dependencies: 220
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, token_hash, ip_address, user_agent, is_active, expires_at, created_at) FROM stdin;
1	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0ODkzODg2NywiZXhwIjoxNzQ5NTQzNjY3LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.EaWnRlFqnLCkz5cVpi0rpRkQDF9vH6U1tHIO6wrAniw	::1	curl/8.7.1	t	2025-06-10 11:21:07.211+03	2025-06-03 11:21:07.211764+03
2	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc0ODkzODg2NywiZXhwIjoxNzQ5NTQzNjY3LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.xgEJwpC4Ghf4nKi8CuIhZnLa3FWDeBgOL0WVNHt5OVM	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-06-10 11:21:07.787+03	2025-06-03 11:21:07.787873+03
3	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc0ODkzODkzMywiZXhwIjoxNzQ5NTQzNzMzLCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.1z_qb9tlMDIbPKUeGrXyBT9z8SIBFm_5MlEAQatGJnA	::1	curl/8.7.1	t	2025-06-10 11:22:13.453+03	2025-06-03 11:22:13.453602+03
4	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0ODkzODkzOSwiZXhwIjoxNzQ5NTQzNzM5LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.iV2_Z9HVwU7RRwnBqU7ln73k3ODiKIovFwRpApIHKD0	::1	curl/8.7.1	t	2025-06-10 11:22:19.768+03	2025-06-03 11:22:19.769098+03
5	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0ODkzOTM2NiwiZXhwIjoxNzQ5NTQ0MTY2LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.k810Vqqby1JxJ2tdB4mYX9VgAD8ctb-_Uf8mPqnxtZ4	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-06-10 11:29:26.218+03	2025-06-03 11:29:26.218608+03
6	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0ODk0NDEzNiwiZXhwIjoxNzQ5NTQ4OTM2LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.NfbLG4MCQweDr2jBsd7RwBZ7ePAcQW9tKMqGskQlZzs	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-06-10 12:48:56.599+03	2025-06-03 12:48:56.599822+03
7	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0ODk0NDg3NiwiZXhwIjoxNzQ5NTQ5Njc2LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.GyyGBs2jM1tTYCiAlbu9VbgdDIFihdi4irucQyzJUhQ	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-06-10 13:01:16.33+03	2025-06-03 13:01:16.331075+03
9	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0OTAxNTEyMywiZXhwIjoxNzQ5NjE5OTIzLCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.wDNlwDWTsLBd9C6cJ_VsNxk9Eb4mECo6Zr5is76-jsE	::1	node	t	2025-06-11 08:32:03.195+03	2025-06-04 08:32:03.195965+03
11	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0OTAxNTQ2NiwiZXhwIjoxNzQ5NjIwMjY2LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.4DsernjchcRbU4IV-IW7kSCINH-At6jTe8dJ_KRDW0A	::1	node	t	2025-06-11 08:37:46.525+03	2025-06-04 08:37:46.52567+03
12	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0OTAxNTU4MSwiZXhwIjoxNzQ5NjIwMzgxLCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.oIwl2_CqoFKkXpqNYSLBbR-bqb6IOsHY2HHoUr_Qva8	::1	node	t	2025-06-11 08:39:41.603+03	2025-06-04 08:39:41.604006+03
13	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0OTAxNTU5NCwiZXhwIjoxNzQ5NjIwMzk0LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.I_W9jxrGsD8SLtrViC3nLGoL4JP_vMI3Mkt7WwvXD24	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-07-04 08:39:54.733+03	2025-06-04 08:39:54.733553+03
14	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0OTAxNzA4NSwiZXhwIjoxNzQ5NjIxODg1LCJhdWQiOiJ1eHVpLWxhYi11c2VycyIsImlzcyI6InV4dWktbGFiIn0.4JTxPUbfU7HCWNAWlE5PK_s_p1XL6Hz0d8sq2RQlFog	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	t	2025-07-04 09:04:45.657+03	2025-06-04 09:04:45.658012+03
\.


--
-- TOC entry 3789 (class 0 OID 53071)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, name, role, is_active, email_verified, settings, created_at, updated_at) FROM stdin;
2	testuser	user@uxuilab.com	$2a$12$kDIx0Ntser04ETS5CWDNWu2dTATlunK56f8IcNRk0dlpZHxJ7VJuO	Тестовый пользователь	user	t	t	{}	2025-06-03 11:11:41.467455+03	2025-06-03 11:11:41.467455+03
3	newuser	newuser@example.com	$2a$12$gVuCf/FwTn8E/ND3fsPhNeOBNJcAoRgy4AfURetZkVXh3GEcEAy5G	Новый Пользователь	user	t	f	{}	2025-06-03 11:21:07.19867+03	2025-06-03 11:21:07.19867+03
4	taulan	taulan@mail.ru	$2a$12$.qa/acFUf.JKnQ/2QKmHwuzMRSrmmjhssINs7GZQDVUAcbJoNoF/u	Таулан Хатуаев	user	t	f	{}	2025-06-03 11:21:07.786961+03	2025-06-03 11:21:07.786961+03
5	testuser2	test2@example.com	$2a$12$okmbw.uvnG7VdWCwdynOr.4Cc6Z46oNGKLLiYo./LBPWMhcQyLh/O	Тест2 Пользователь2	user	t	f	{}	2025-06-03 11:22:13.447792+03	2025-06-03 11:22:13.447792+03
6	Maks	maks@mail.ru	$2a$12$y3gHxZRS1N1ODG8VxeOb/uCBDv9il0eb06raBjvPNnTHDZse/3lhO	Maks G	user	t	f	{}	2025-06-03 11:29:26.215153+03	2025-06-04 08:11:52.104621+03
1	admin	admin@uxuilab.com	$2a$12$/3bUXfoaQiqdxYxttF9YBerJH4JwrEroYK.PQnqU9jBgR8ZVhJPgG	Администратор	admin	t	t	{}	2025-06-03 11:11:41.203105+03	2025-06-04 17:22:49.827704+03
\.


--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 215
-- Name: analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analyses_id_seq', 197, true);


--
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 221
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shadownight
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, false);


--
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 223
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shadownight
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- TOC entry 3821 (class 0 OID 0)
-- Dependencies: 213
-- Name: project_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_files_id_seq', 1, false);


--
-- TOC entry 3822 (class 0 OID 0)
-- Dependencies: 211
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 128, true);


--
-- TOC entry 3823 (class 0 OID 0)
-- Dependencies: 217
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 119, true);


--
-- TOC entry 3824 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 15, true);


--
-- TOC entry 3825 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- TOC entry 3622 (class 2606 OID 53140)
-- Name: analyses analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 53252)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 3637 (class 2606 OID 53272)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 53119)
-- Name: project_files project_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 53104)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 53160)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 3630 (class 2606 OID 53181)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 53089)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3613 (class 2606 OID 53085)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3615 (class 2606 OID 53087)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3623 (class 1259 OID 53188)
-- Name: idx_analyses_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analyses_project_id ON public.analyses USING btree (project_id);


--
-- TOC entry 3633 (class 1259 OID 53258)
-- Name: idx_assets_project_id; Type: INDEX; Schema: public; Owner: shadownight
--

CREATE INDEX idx_assets_project_id ON public.assets USING btree (project_id);


--
-- TOC entry 3634 (class 1259 OID 53279)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: shadownight
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- TOC entry 3635 (class 1259 OID 53278)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: shadownight
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 3616 (class 1259 OID 53187)
-- Name: idx_projects_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);


--
-- TOC entry 3624 (class 1259 OID 53189)
-- Name: idx_reports_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_project_id ON public.reports USING btree (project_id);


--
-- TOC entry 3627 (class 1259 OID 53191)
-- Name: idx_user_sessions_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_token_hash ON public.user_sessions USING btree (token_hash);


--
-- TOC entry 3628 (class 1259 OID 53190)
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- TOC entry 3648 (class 2620 OID 53280)
-- Name: assets update_assets_updated_at; Type: TRIGGER; Schema: public; Owner: shadownight
--

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3647 (class 2620 OID 53194)
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3646 (class 2620 OID 53193)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3640 (class 2606 OID 53141)
-- Name: analyses analyses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 3644 (class 2606 OID 53253)
-- Name: assets assets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 3645 (class 2606 OID 53273)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shadownight
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3639 (class 2606 OID 53120)
-- Name: project_files project_files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 3638 (class 2606 OID 53105)
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3642 (class 2606 OID 53166)
-- Name: reports reports_analysis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;


--
-- TOC entry 3641 (class 2606 OID 53161)
-- Name: reports reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 3643 (class 2606 OID 53182)
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-04 17:31:13 MSK

--
-- PostgreSQL database dump complete
--

